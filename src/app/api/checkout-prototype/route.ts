import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  clampCustomPrintingDeckQty,
  getCustomPrintingTotalUsd,
} from '@/lib/custom-printing-estimate-usd';

const FRANKFURTER_USD_TO_NZD = 'https://api.frankfurter.app/latest?from=USD&to=NZD';
/** Offline fallback — aligned with tct-fx-rates getFxRatesForBrowser catch block */
const FALLBACK_USD_NZD = 1.65;

const MAX_UNIT_AMOUNT_NZD = 50_000_00;
const MIN_UNIT_AMOUNT_NZD = 50;

async function fetchUsdToNzdRate(): Promise<number> {
  try {
    const res = await fetch(FRANKFURTER_USD_TO_NZD, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return FALLBACK_USD_NZD;
    const data = (await res.json()) as { rates?: { NZD?: number } };
    const n = data.rates?.NZD;
    return typeof n === 'number' && n > 0 ? n : FALLBACK_USD_NZD;
  } catch {
    return FALLBACK_USD_NZD;
  }
}

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
  const totalUsd = Number(record.totalUsd);
  const qtyRaw = record.deckQty;
  const deckQtyParsed =
    typeof qtyRaw === 'number' && Number.isFinite(qtyRaw)
      ? qtyRaw
      : Number.parseInt(String(qtyRaw ?? '1'), 10);

  if (!Number.isFinite(deckQtyParsed)) {
    return NextResponse.json({ error: 'Invalid deckQty' }, { status: 400 });
  }

  const safeQty = clampCustomPrintingDeckQty(deckQtyParsed);

  if (!Number.isFinite(totalUsd) || totalUsd <= 0) {
    return NextResponse.json({ error: 'Invalid totalUsd' }, { status: 400 });
  }

  const expectedUsd = getCustomPrintingTotalUsd(safeQty);
  if (Math.abs(totalUsd - expectedUsd) > 0.01) {
    return NextResponse.json({ error: 'Amount does not match quantity' }, { status: 400 });
  }

  const nzdRate = await fetchUsdToNzdRate();
  const amountCents = Math.round(totalUsd * nzdRate * 100);

  if (!Number.isInteger(amountCents) || amountCents < MIN_UNIT_AMOUNT_NZD || amountCents > MAX_UNIT_AMOUNT_NZD) {
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
          currency: 'nzd',
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
      totalUsd: String(expectedUsd),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
