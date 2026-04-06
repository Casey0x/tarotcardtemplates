import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient, createServerClient as createAppServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getSignedCardUrl, getSignedStudioArtworkUrl } from '@/lib/getSignedCardUrl';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

const FALLBACK_BORDER_SLUG = 'default-border';

async function fetchSessionCardsPayload(
  supabase: Awaited<ReturnType<typeof createAppServerClient>>,
  deckId: string,
) {
  const { data: rawCards, error: cardsErr } = await supabase
    .from('studio_cards')
    .select('card_key, card_name, numeral, image_url, image_path, card_index')
    .eq('deck_id', deckId);

  if (cardsErr) {
    console.error('[studio-session] cards query:', cardsErr.message, cardsErr.code, cardsErr.details);
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
 * POST { borderSlug } — fetch or create the user's single studio deck; returns deckId + saved cards.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAppServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[studio-session] auth error:', userError);
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('[studio-session] user:', user.id);

    let body: { borderSlug?: string };
    try {
      body = (await request.json()) as { borderSlug?: string };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const borderSlug = String(body.borderSlug ?? '').trim();
    const borderSlugForDb = borderSlug || FALLBACK_BORDER_SLUG;

    const { data: decks, error: fetchError } = await supabase
      .from('studio_decks')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (fetchError) {
      console.error('[studio-session] fetch error:', fetchError.message, fetchError.code, fetchError.details);
      return new Response('Failed to fetch deck', { status: 500 });
    }

    const existingDeck = decks?.[0];
    let deckId: string;

    if (existingDeck) {
      console.log('[studio-session] using existing deck:', existingDeck.id);

      if (borderSlugForDb !== existingDeck.border_slug) {
        const { error: updateError } = await supabase
          .from('studio_decks')
          .update({
            border_slug: borderSlugForDb,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDeck.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('[studio-session] border update error:', updateError.message, updateError.code);
          return new Response('Failed to update deck', { status: 500 });
        }
      }

      deckId = existingDeck.id;
    } else {
      console.log('[studio-session] incoming borderSlug:', body.borderSlug);

      const { data: newDeck, error: insertError } = await supabase
        .from('studio_decks')
        .insert({
          user_id: user.id,
          border_slug: borderSlugForDb,
        })
        .select()
        .single();

      if (insertError || !newDeck) {
        console.error('[studio-session] insert error:', insertError?.message, insertError?.code, insertError?.details);
        return new Response('Failed to create deck', { status: 500 });
      }

      console.log('[studio-session] created deck:', newDeck.id);
      deckId = newDeck.id;
    }

    const payload = await fetchSessionCardsPayload(supabase, deckId);
    if ('error' in payload) {
      return new Response('Failed to load cards', { status: 500 });
    }

    return NextResponse.json({
      deckId,
      cards: payload.cards,
    });
  } catch (e) {
    console.error('[studio-session] unhandled:', e);
    return new Response('Internal server error', { status: 500 });
  }
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
