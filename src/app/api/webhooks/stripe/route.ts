import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { getEmailFrom, getEmailReplyTo } from '@/lib/email-env';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendPurchaseEmail(to: string, templateName: string, templateSlug: string, sessionId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();
  const resend = new Resend(apiKey);

  const safeName = escapeHtml(templateName);
  const safeSessionId = escapeHtml(sessionId);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#3d3d3d;">
        <p style="margin:0 0 16px;">Thank you for your purchase — we&apos;ve received your order.</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#1a1814;">
          <strong>${safeName}</strong>
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#6b6560;">
          Order reference: <strong>${safeSessionId}</strong>
        </p>
        <p style="margin:0 0 20px;">Your template is being prepared for delivery. We&apos;ll send your files manually — you can expect delivery within <strong style="color:#1a1814;">24 hours</strong>.</p>
        <p style="margin:0 0 12px;">If you have questions or need to share details, reply to this email or contact us at <a href="mailto:casey@choiceprint.co.nz" style="color:#1a1814;font-weight:600;">casey@choiceprint.co.nz</a>.</p>
        <p style="margin:16px 0 0;font-size:13px;color:#6b6560;">— Tarot Card Templates</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: 'Your Tarot Template Order ✨',
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
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

  if (meta?.purchaseType === 'deck_export' && meta?.user_id && meta?.borderSlug) {
    const amountPaid = typeof session.amount_total === 'number' ? session.amount_total : 0;
    const customerDetails = session.customer_details;
    const email = customerDetails?.email ?? session.customer_email ?? null;
    const borderName = meta.borderName ?? meta.borderSlug;

    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_id: meta.user_id,
      border_slug: meta.borderSlug,
      border_name: borderName,
      purchase_type: 'deck_export',
      email,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      status: 'paid',
      templated_template_id: null,
      suite_size: null,
      card_count: null,
    });

    if (purchaseError) {
      console.error('[stripe-webhook] deck_export purchases insert failed', purchaseError);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    console.log('[stripe-webhook] deck_export purchase recorded', {
      sessionId: session.id,
      borderSlug: meta.borderSlug,
    });
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
    const email = customerDetails?.email ?? null;

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

    if (email && purchaseType === 'template') {
      try {
        await sendPurchaseEmail(email, templateName, templateSlug, session.id);
        console.log('[stripe-webhook] Template purchase confirmation email sent', {
          to: email,
          templateSlug,
          sessionId: session.id,
        });
      } catch (err) {
        console.error(
          '[stripe-webhook] Template purchase confirmation email failed',
          err instanceof Error ? err.message : err,
          err instanceof Error ? err.stack : '',
        );
      }
    } else if (!email && purchaseType === 'template') {
      console.warn('[stripe-webhook] Skipping template confirmation email: no customer email on session', {
        sessionId: session.id,
        templateSlug,
      });
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
}
