import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import {
  sendTemplateOrderCustomerEmail,
  sendTemplateOrderOwnerEmail,
} from '@/lib/template-purchase-emails';

function orderReferenceFromSession(session: Stripe.Checkout.Session, meta: Stripe.Metadata | null): string {
  const rawMeta = meta?.orderReference;
  if (typeof rawMeta === 'string' && rawMeta.trim().length > 0) {
    return rawMeta.trim();
  }
  const raw = session.id.replace(/^cs_(test_|live_)?/i, '');
  return raw.slice(0, 12).toUpperCase();
}

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

  const supabase = createServiceClient();

  if (
    (meta?.purchaseType === 'deck_download' || meta?.purchaseType === 'deck_export') &&
    meta?.user_id &&
    meta?.borderSlug
  ) {
    const amountPaid = typeof session.amount_total === 'number' ? session.amount_total : 0;
    const customerDetails = session.customer_details;
    const email = customerDetails?.email ?? session.customer_email ?? null;
    const borderName = meta.borderName ?? meta.borderSlug;
    const purchaseTypeRow =
      meta.purchaseType === 'deck_download' ? 'deck_download' : 'deck_export';

    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_id: meta.user_id,
      border_slug: meta.borderSlug,
      border_name: borderName,
      purchase_type: purchaseTypeRow,
      email,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: 'paid',
      templated_template_id: null,
      suite_size: null,
      card_count: null,
    });

    if (purchaseError) {
      console.error('[stripe-webhook] deck_download purchases insert failed', purchaseError);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    console.log('[stripe-webhook] deck digital purchase recorded', {
      sessionId: session.id,
      borderSlug: meta.borderSlug,
      purchaseType: purchaseTypeRow,
    });
    return NextResponse.json({ received: true });
  }

  if (
    meta?.purchaseType === 'print' &&
    meta?.studioPrint === '1' &&
    meta?.user_id &&
    meta?.borderSlug
  ) {
    const amountPaid = typeof session.amount_total === 'number' ? session.amount_total : 0;
    const customerDetails = session.customer_details;
    const email = customerDetails?.email ?? session.customer_email ?? null;
    const borderName = meta.borderName ?? meta.borderSlug;
    const templateSlug = meta.templateSlug ?? `studio-print:${meta.borderSlug}`;
    const templateName =
      meta.templateName ?? `${borderName} — Printed deck (Studio)`;

    const baseRow = {
      email,
      template_slug: templateSlug,
      template_name: templateName,
      purchase_type: 'print' as const,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: 'ordered' as const,
      shipping_name: customerDetails?.name ?? null,
      shipping_line1: customerDetails?.address?.line1 ?? null,
      shipping_line2: customerDetails?.address?.line2 ?? null,
      shipping_city: customerDetails?.address?.city ?? null,
      shipping_postcode: customerDetails?.address?.postal_code ?? null,
      shipping_country: customerDetails?.address?.country ?? null,
    };

    const { error: templatePurchaseError } = await supabase.from('template_purchases').insert(baseRow);

    if (templatePurchaseError) {
      console.error('[stripe-webhook] studio print template_purchases insert failed', templatePurchaseError);
      return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
    }

    const { error: unlockError } = await supabase.from('purchases').insert({
      user_id: meta.user_id,
      border_slug: meta.borderSlug,
      border_name: borderName,
      purchase_type: 'print',
      email,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: 'paid',
      templated_template_id: null,
      suite_size: null,
      card_count: null,
    });

    if (unlockError) {
      console.error('[stripe-webhook] studio print purchases insert failed', unlockError);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    console.log('[stripe-webhook] studio print recorded', { sessionId: session.id, borderSlug: meta.borderSlug });
    return NextResponse.json({ received: true });
  }

  const purchaseType = meta?.purchaseType;
  if (purchaseType === 'template' || purchaseType === 'print') {
    const templateSlug = meta?.templateSlug;
    const templateName = meta?.templateName;
    if (!templateSlug || !templateName) {
      return NextResponse.json({ error: 'Missing template metadata' }, { status: 400 });
    }

    const amountPaid = typeof session.amount_total === 'number' ? session.amount_total : 0;
    const customerDetails = session.customer_details;
    console.log('[stripe-webhook] customer_details', customerDetails);
    const email = customerDetails?.email ?? session.customer_email ?? null;

    const baseRow = {
      email,
      template_slug: templateSlug,
      template_name: templateName,
      purchase_type: purchaseType,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: purchaseType === 'template' ? 'paid' : 'ordered',
    };

    const row =
      purchaseType === 'print'
        ? {
            ...baseRow,
            shipping_name: customerDetails?.name ?? null,
            shipping_line1: customerDetails?.address?.line1 ?? null,
            shipping_line2: customerDetails?.address?.line2 ?? null,
            shipping_city: customerDetails?.address?.city ?? null,
            shipping_postcode: customerDetails?.address?.postal_code ?? null,
            shipping_country: customerDetails?.address?.country ?? null,
          }
        : baseRow;

    const { error: templatePurchaseError } = await supabase.from('template_purchases').insert(row);

    if (templatePurchaseError) {
      console.error('[stripe-webhook] template_purchases insert failed', templatePurchaseError);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    console.log('[stripe-webhook] template_purchases insert succeeded', {
      sessionId: session.id,
      templateSlug,
      purchaseType,
    });

    if (purchaseType === 'template') {
      const orderRef = orderReferenceFromSession(session, meta);
      const customerName = customerDetails?.name?.trim() || '—';
      const ownerEmail = email ?? '(no email on session)';

      try {
        if (email) {
          await sendTemplateOrderCustomerEmail({
            to: email,
            productName: templateName,
            orderReference: orderRef,
          });
          console.log('[stripe-webhook] Template order customer email sent', {
            to: email,
            orderRef,
            sessionId: session.id,
          });
        } else {
          console.warn('[stripe-webhook] Skipping customer confirmation: no email on session', {
            sessionId: session.id,
            templateSlug,
          });
        }

        await sendTemplateOrderOwnerEmail({
          customerName,
          customerEmail: ownerEmail,
          productName: templateName,
          orderReference: orderRef,
          stripeSessionId: session.id,
        });
        console.log('[stripe-webhook] Template order owner notification sent', { orderRef, sessionId: session.id });
      } catch (err) {
        console.error(
          '[stripe-webhook] Template order email failed',
          err instanceof Error ? err.message : err,
          err instanceof Error ? err.stack : '',
        );
      }
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
}
