import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { TAROT_CARDS_78 } from '@/lib/tarot-cards';

/** Dev-only: create a test purchase + deck + 78 cards. Requires auth. */
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();

  const { data: purchase, error: purchaseError } = await admin
    .from('purchases')
    .insert({
      user_id: user.id,
      border_slug: 'vintage-velvet',
      border_name: 'Vintage Velvet Border',
      templated_template_id: '669959c5-4cca-476b-a484-5a9b1158e2a4',
      suite_size: 'Full deck (78 cards)',
      card_count: 78,
      amount_paid: 0,
      status: 'paid',
    })
    .select('id')
    .single();

  if (purchaseError || !purchase) {
    console.error('Dev deck: purchase insert failed', purchaseError);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }

  const { data: deck, error: deckError } = await admin
    .from('decks')
    .insert({
      user_id: user.id,
      purchase_id: purchase.id,
      border_slug: 'vintage-velvet',
      border_name: 'Vintage Velvet Border',
      templated_template_id: '669959c5-4cca-476b-a484-5a9b1158e2a4',
      total_cards: 78,
      completed_cards: 0,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (deckError || !deck) {
    console.error('Dev deck: deck insert failed', deckError);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }

  const cardRows = TAROT_CARDS_78.map((card) => ({
    deck_id: deck.id,
    card_index: card.index,
    card_name: card.name,
    numeral: card.numeral,
    status: 'empty',
  }));
  const { error: cardsError } = await admin.from('cards').insert(cardRows);
  if (cardsError) {
    console.error('Dev deck: cards insert failed', cardsError);
    return NextResponse.json({ error: 'Failed to create cards' }, { status: 500 });
  }

  return NextResponse.json({ deckId: deck.id });
}
