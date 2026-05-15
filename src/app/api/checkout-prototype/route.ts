import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const ALLOWED_CURRENCIES = new Set(['usd', 'nzd', 'aud', 'gbp']);
/** Sanity cap: minor units (e.g. 50_000_00 = $500,000 in major units) */
const MAX_UNIT_AMOUNT = 50_000_00;
const MIN_UNIT_AMOUNT = 50;

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

  if (!stripeSecret || !siteUrl) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const amountCents = Number(record.amountCents);
  const currency = typeof record.currency === 'string' ? record.currency.trim().toLowerCase() : '';
  const qtyRaw = record.deckQty;
  const deckQtyParsed =
    typeof qtyRaw === 'number' && Number.isFinite(qtyRaw)
      ? Math.floor(qtyRaw)
      : Number.parseInt(String(qtyRaw ?? '1'), 10);
  const safeQty = Number.isFinite(deckQtyParsed) && deckQtyParsed >= 1 ? Math.min(deckQtyParsed, 10_000) : 1;

  if (!ALLOWED_CURRENCIES.has(currency)) {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
  }
  if (!Number.isInteger(amountCents) || amountCents < MIN_UNIT_AMOUNT || amountCents > MAX_UNIT_AMOUNT) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);
  const productName =
    safeQty === 1
      ? 'Custom printing — prototype deck (1 deck)'
      : `Custom printing — ${safeQty} decks`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: productName },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/custom-printing/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/custom-printing`,
    metadata: {
      orderType: 'custom_printing_prototype',
      deckQty: String(safeQty),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
