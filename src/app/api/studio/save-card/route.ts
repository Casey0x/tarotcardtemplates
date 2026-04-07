import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    deckId?: string;
    deck_id?: string;
    cardKey?: string;
    card_key?: string;
    cardName?: string;
    numeral?: string;
    /** Storage path in `studio-uploads`, or null to remove artwork */
    artworkPath?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const deckId = String(body.deckId ?? body.deck_id ?? '').trim();
  const cardKey = String(body.cardKey ?? body.card_key ?? '').trim();
  if (!deckId || !cardKey) {
    return NextResponse.json({ error: 'deckId and cardKey required' }, { status: 400 });
  }

  const cardIndex = parseInt(cardKey, 10);
  if (Number.isNaN(cardIndex)) {
    return NextResponse.json({ error: 'Invalid cardKey' }, { status: 400 });
  }

  const admin = createServiceClient();

  const { data: deckRow, error: deckErr } = await admin
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr || !deckRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: indexRow } = await admin
    .from('studio_cards')
    .select('id, image_url')
    .eq('deck_id', deckId)
    .eq('card_index', cardIndex)
    .maybeSingle();

  const existingRow: { id: string; image_url: string | null } | null = indexRow?.id
    ? { id: indexRow.id, image_url: indexRow.image_url ?? null }
    : null;

  let nextImageUrl = existingRow?.image_url ?? null;

  if (body.artworkPath !== undefined) {
    if (body.artworkPath === null) {
      const prev = existingRow?.image_url;
      if (prev && isLikelySupabaseStoragePath(prev)) {
        await admin.storage.from('studio-uploads').remove([prev]);
      }
      nextImageUrl = null;
    } else {
      nextImageUrl = body.artworkPath;
    }
  }

  const rowPayload = {
    deck_id: deckId,
    user_id: user.id,
    card_index: cardIndex,
    /** Legacy NOT NULL column — keep in sync with numeric card_index for upserts/renders */
    card_key: cardKey,
    card_name: body.cardName ?? null,
    numeral: body.numeral ?? null,
    image_url: nextImageUrl,
    updated_at: new Date().toISOString(),
  };

  if (existingRow?.id) {
    const { error: updErr } = await admin.from('studio_cards').update(rowPayload).eq('id', existingRow.id);
    if (updErr) {
      console.error('[studio/save-card]', updErr);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
  } else {
    const { error: insErr } = await admin.from('studio_cards').insert(rowPayload);
    if (insErr) {
      console.error('[studio/save-card]', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  const { error: touchErr } = await admin
    .from('studio_decks')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (touchErr) {
    console.warn('[studio/save-card] deck touch', touchErr.message);
  }

  return NextResponse.json({ ok: true });
}
