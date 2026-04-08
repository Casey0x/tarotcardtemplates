import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { hasFullDeckUnlockedByAllSuitePurchases } from '@/lib/studio-export-constants';

export const dynamic = 'force-dynamic';

/** GET ?deckId= — paid Studio export flags per deck for the signed-in user. */
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

  const types = (rows ?? []).map((r) => r.export_type);

  const paidMajorArcana = types.includes('major_arcana');
  const paidWands = types.includes('wands');
  const paidCups = types.includes('cups');
  const paidSwords = types.includes('swords');
  const paidPentacles = types.includes('pentacles');
  const paidFullDeck = types.includes('full_deck');
  const fullDeckUnlockedByAllSuites = hasFullDeckUnlockedByAllSuitePurchases(types);

  return NextResponse.json({
    paidMajorArcana,
    paidWands,
    paidCups,
    paidSwords,
    paidPentacles,
    paidFullDeck,
    fullDeckUnlockedByAllSuites,
  });
}
