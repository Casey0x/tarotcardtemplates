import Stripe from 'stripe';

export type VerifiedTemplateCheckout =
  | {
      ok: true;
      orderReference: string;
      productName: string;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Confirms a Stripe Checkout session is a paid **template** (digital) purchase
 * and returns display fields for the /download success page.
 */
export async function verifyTemplateCheckoutSession(sessionId: string): Promise<VerifiedTemplateCheckout> {
  const id = sessionId.trim();
  if (!id) {
    return { ok: false, error: 'Missing order session.' };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { ok: false, error: 'Order verification is not configured.' };
  }

  const stripe = new Stripe(stripeSecret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(id);
  } catch {
    return {
      ok: false,
      error: 'We could not verify this order. Check your link or email us at casey@tarotcardtemplates.com.',
    };
  }

  if (session.payment_status !== 'paid') {
    return {
      ok: false,
      error:
        'Payment is not completed yet. If you were charged, please contact casey@tarotcardtemplates.com with your receipt.',
    };
  }

  const meta = session.metadata ?? {};
  if (meta.purchaseType !== 'template') {
    return {
      ok: false,
      error: 'This page is only for digital template orders. For other purchases, check your email or account.',
    };
  }

  const productName =
    typeof meta.templateName === 'string' && meta.templateName.trim().length > 0
      ? meta.templateName.trim()
      : 'your template';

  let orderReference =
    typeof meta.orderReference === 'string' && meta.orderReference.trim().length > 0
      ? meta.orderReference.trim()
      : '';

  if (!orderReference) {
    const raw = session.id.replace(/^cs_(test_|live_)?/i, '');
    orderReference = raw.slice(0, 12).toUpperCase();
  }

  return { ok: true, orderReference, productName };
}
