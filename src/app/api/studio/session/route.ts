import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient, createServerClient as createAppServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getSignedCardUrl, getSignedStudioArtworkUrl } from '@/lib/getSignedCardUrl';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

async function fetchSessionCardsPayload(
  supabase: Awaited<ReturnType<typeof createAppServerClient>>,
  deckId: string,
) {
  const { data: rawCards, error: cardsErr } = await supabase
    .from('studio_cards')
    .select('card_key, card_name, numeral, image_url, image_path, card_index')
    .eq('deck_id', deckId);

  if (cardsErr) {
    return { error: cardsErr } as const;
  }

  const cards = await Promise.all(
    (rawCards ?? []).map(async (row) => {
      const artwork_path = row.image_url && isLikelySupabaseStoragePath(row.image_url) ? row.image_url : null;

      let image_url: string | null = null;
      if (artwork_path) {
        image_url = await getSignedStudioArtworkUrl(artwork_path);
      } else if (row.image_url) {
        image_url = row.image_url;
      }

      let rendered_url: string | null = null;
      if (row.image_path && isLikelySupabaseStoragePath(row.image_path)) {
        rendered_url = await getSignedCardUrl(row.image_path);
      }

      return {
        card_key: row.card_key,
        card_index: row.card_index,
        card_name: row.card_name,
        numeral: row.numeral,
        image_url,
        artwork_path,
        rendered_url,
      };
    }),
  );

  return { cards } as const;
}

/**
 * POST { borderSlug } — single deck per user; returns deckId + saved cards for Studio client.
 */
export async function POST(request: Request) {
  const supabase = await createAppServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { borderSlug?: string };
  try {
    body = (await request.json()) as { borderSlug?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const borderSlug = String(body.borderSlug ?? '').trim();
  if (!borderSlug) {
    return NextResponse.json({ error: 'borderSlug required' }, { status: 400 });
  }

  const { data: existingDeck, error: findErr } = await supabase
    .from('studio_decks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (findErr) {
    console.error('[studio/session POST] find deck', findErr);
    return NextResponse.json({ error: 'Failed to load deck' }, { status: 500 });
  }

  let deckId: string;

  if (existingDeck) {
    if (borderSlug && borderSlug !== existingDeck.border_slug) {
      const { error: updErr } = await supabase
        .from('studio_decks')
        .update({
          border_slug: borderSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDeck.id);

      if (updErr) {
        console.error('[studio/session POST] update border', updErr);
        return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
      }
    }

    deckId = existingDeck.id;
  } else {
    const inserted = await supabase
      .from('studio_decks')
      .insert({
        user_id: user.id,
        border_slug: borderSlug,
      })
      .select()
      .single();

    if (inserted.error || !inserted.data) {
      console.error('[studio/session POST] insert deck', inserted.error);
      return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
    }

    deckId = inserted.data.id;
  }

  const payload = await fetchSessionCardsPayload(supabase, deckId);
  if ('error' in payload) {
    console.error('[studio/session POST] cards', payload.error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({
    deckId,
    cards: payload.cards,
  });
}

/** GET ?session_id=cs_xxx — returns { deckId } for Stripe checkout success redirect. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    },
  );
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', session.user.id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('purchase_id', purchase.id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!deck?.id) {
    return NextResponse.json({ deckId: null as string | null });
  }

  return NextResponse.json({ deckId: deck.id });
}
