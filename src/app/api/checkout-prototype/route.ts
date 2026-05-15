import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/** $78.00 NZD — dynamic line item (no Stripe Price ID). */
const PROTOTYPE_UNIT_AMOUNT_NZD = 7_800;

export async function POST() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

  if (!stripeSecret || !siteUrl) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'nzd',
          product_data: {
            name: 'Custom printing — prototype deck (1 deck)',
          },
          unit_amount: PROTOTYPE_UNIT_AMOUNT_NZD,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/custom-printing/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/custom-printing`,
    metadata: {
      orderType: 'custom_printing_prototype',
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
