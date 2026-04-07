import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/** GET ?deckId= — whether the signed-in user has paid for each Studio export type for this deck. */
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deckId = new URL(request.url).searchParams.get('deckId')?.trim() ?? '';
  if (!deckId) {
    return NextResponse.json({ error: 'Missing deckId' }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data: deck, error: deckErr } = await admin
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr) {
    console.error('[studio/export-status] deck', deckErr);
    return NextResponse.json({ error: 'Deck lookup failed' }, { status: 500 });
  }
  if (!deck?.id) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  const { data: rows, error } = await admin
    .from('studio_exports')
    .select('export_type')
    .eq('user_id', user.id)
    .eq('deck_id', deckId);

  if (error) {
    console.error('[studio/export-status]', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  const paidMajorArcana = (rows ?? []).some((r) => r.export_type === 'major_arcana');
  const paidFullDeck = (rows ?? []).some((r) => r.export_type === 'full_deck');

  return NextResponse.json({ paidMajorArcana, paidFullDeck });
}
