import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { isStudioExportType } from '@/lib/studio-export-constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error('[studio/webhook] signature', e);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, skipped: true });
    }
    const meta = session.metadata ?? {};
    const deckId = typeof meta.deckId === 'string' ? meta.deckId : '';
    const exportTypeRaw = typeof meta.exportType === 'string' ? meta.exportType : '';
    const userId = typeof meta.userId === 'string' ? meta.userId : '';
    if (!deckId || !userId || !isStudioExportType(exportTypeRaw)) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const admin = createServiceClient();
    const { error } = await admin.from('studio_exports').upsert(
      {
        user_id: userId,
        deck_id: deckId,
        export_type: exportTypeRaw,
        stripe_session_id: session.id,
      },
      { onConflict: 'user_id,deck_id,export_type' },
    );
    if (error) {
      console.error('[studio/webhook] upsert', error);
      return NextResponse.json({ error: 'Persist failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
