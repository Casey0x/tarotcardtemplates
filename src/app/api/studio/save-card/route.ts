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
    cardKey?: string;
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

  const deckId = String(body.deckId ?? '').trim();
  const cardKey = String(body.cardKey ?? '').trim();
  if (!deckId || !cardKey) {
    return NextResponse.json({ error: 'deckId and cardKey required' }, { status: 400 });
  }

  const cardIndex = parseInt(cardKey, 10);
  if (Number.isNaN(cardIndex)) {
    return NextResponse.json({ error: 'Invalid cardKey' }, { status: 400 });
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

  const admin = createServiceClient();

  const { data: existing } = await admin
    .from('studio_cards')
    .select('image_url')
    .eq('deck_id', deckId)
    .eq('card_index', cardIndex)
    .maybeSingle();

  let nextImageUrl = existing?.image_url ?? null;

  if (body.artworkPath !== undefined) {
    if (body.artworkPath === null) {
      const prev = existing?.image_url;
      if (prev && isLikelySupabaseStoragePath(prev)) {
        await admin.storage.from('studio-uploads').remove([prev]);
      }
      nextImageUrl = null;
    } else {
      nextImageUrl = body.artworkPath;
    }
  }

  const { error: upsertErr } = await admin.from('studio_cards').upsert(
    {
      deck_id: deckId,
      user_id: user.id,
      card_key: cardKey,
      card_index: cardIndex,
      card_name: body.cardName ?? null,
      numeral: body.numeral ?? null,
      image_url: nextImageUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'deck_id,card_index' },
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
