import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

/** PATCH: update card draft (artwork_url, numeral, card_name) without rendering. */
export async function PATCH(request: Request) {
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

  const body = await request.json();
  const { deckId, cardId, artworkUrl, cardName, numeral } = body as Record<string, string | undefined>;
  if (!deckId || !cardId) {
    return NextResponse.json({ error: 'Missing deckId or cardId' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: deck } = await supabase
    .from('decks')
    .select('id, user_id')
    .eq('id', deckId)
    .single();

  if (!deck || deck.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Deck not found or access denied' }, { status: 403 });
  }

  const updates: Record<string, string | null> = {};
  if (artworkUrl !== undefined) updates.artwork_url = artworkUrl || null;
  if (cardName !== undefined) updates.card_name = cardName || null;
  if (numeral !== undefined) updates.numeral = numeral || null;

  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .eq('deck_id', deckId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
