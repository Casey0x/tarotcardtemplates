import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    deckId?: string;
    cardKey?: string;
    cardName?: string;
    numeral?: string;
    imageUrl?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const deckId = String(body.deckId ?? '').trim();
  const cardKey = String(body.cardKey ?? '').trim();
  if (!deckId || !cardKey) {
    return NextResponse.json({ error: 'deckId and cardKey required' }, { status: 400 });
  }

  const { data: deckRow, error: deckErr } = await supabase
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr || !deckRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: upsertErr } = await supabase.from('studio_cards').upsert(
    {
      deck_id: deckId,
      card_key: cardKey,
      card_name: body.cardName ?? null,
      numeral: body.numeral ?? null,
      image_url: body.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'deck_id,card_key' },
  );

  if (upsertErr) {
    console.error('[studio/save-card]', upsertErr);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  const { error: touchErr } = await supabase
    .from('studio_decks')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (touchErr) {
    console.warn('[studio/save-card] deck touch', touchErr.message);
  }

  return NextResponse.json({ ok: true });
}
