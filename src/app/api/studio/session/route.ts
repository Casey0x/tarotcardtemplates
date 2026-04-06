import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient, createServiceClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

/**
 * POST { borderSlug } — load or create persistent Studio project; returns deckId + saved cards.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  console.log('[studio-session] user_id:', user.id);
  console.log('[studio-session] deck found/created:', deck);

  const { data: cards, error: cardsErr } = await supabase
    .from('studio_cards')
    .select('card_key, card_name, numeral, image_url')
    .eq('deck_id', deck.id);

  if (cardsErr) {
    console.error('[studio/session POST] cards', cardsErr);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({
    deckId: deck.id,
    cards: cards ?? [],
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
    }
  );
  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
