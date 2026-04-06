import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient, createServerClient as createAppServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getSignedCardUrl, getSignedStudioArtworkUrl } from '@/lib/getSignedCardUrl';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

/**
 * POST { borderSlug } — load or create persistent Studio project; returns deckId + saved cards.
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

  const upserted = await supabase
    .from('studio_decks')
    .upsert(
      { user_id: user.id, border_slug: borderSlug },
      { onConflict: 'user_id,border_slug' },
    )
    .select('*')
    .single();

  if (upserted.error || !upserted.data) {
    console.error('[studio/session POST] upsert deck', upserted.error);
    return NextResponse.json({ error: 'Failed to load deck' }, { status: 500 });
  }

  const deck = upserted.data;

  const { data: rawCards, error: cardsErr } = await supabase
    .from('studio_cards')
    .select('card_key, card_name, numeral, image_url, image_path, card_index')
    .eq('deck_id', deck.id);

  if (cardsErr) {
    console.error('[studio/session POST] cards', cardsErr);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
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

  return NextResponse.json({
    deckId: deck.id,
    cards,
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
