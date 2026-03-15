import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeSecret);
  let event: Stripe.Event;
  try {
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata;
  if (!meta?.user_id || !meta?.borderSlug || !meta?.borderName || !meta?.templatedTemplateId || !meta?.suiteSize || !meta?.cardCount) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const cardCount = parseInt(meta.cardCount, 10);
  const amountPaid = typeof session.amount_total === 'number' ? session.amount_total : 0;

  const supabase = createServiceClient();

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      user_id: meta.user_id,
      border_slug: meta.borderSlug,
      border_name: meta.borderName,
      templated_template_id: meta.templatedTemplateId,
      suite_size: meta.suiteSize,
      card_count: cardCount,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: 'paid',
    })
    .select('id')
    .single();

  if (purchaseError || !purchase) {
    console.error('Purchase insert failed', purchaseError);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: meta.user_id,
      purchase_id: purchase.id,
      border_slug: meta.borderSlug,
      border_name: meta.borderName,
      templated_template_id: meta.templatedTemplateId,
      total_cards: cardCount,
      completed_cards: 0,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (deckError || !deck) {
    console.error('Deck insert failed', deckError);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }

  // Seed card rows so the designer can fill them one by one
  const cardRows = Array.from({ length: cardCount }, (_, i) => ({
    deck_id: deck.id,
    card_index: i,
    status: 'empty',
  }));
  const { error: cardsError } = await supabase.from('cards').insert(cardRows);
  if (cardsError) {
    console.error('Cards insert failed', cardsError);
    // Don't fail the webhook; deck exists, cards can be created on first edit
  }

  return NextResponse.json({ received: true, deckId: deck.id });
}
