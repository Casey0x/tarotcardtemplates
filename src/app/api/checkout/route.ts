import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { createPrintOrder } from '@/lib/orders';
import { cookies } from 'next/headers';

type PurchaseType = 'template' | 'print';

/** Border purchase payload (Stripe flow). */
interface BorderCheckoutBody {
  borderSlug: string;
  borderName: string;
  templatedTemplateId: string;
  suiteSize: string;
  cardCount: number;
  amountPence: number;
}

function isBorderCheckoutBody(body: unknown): body is BorderCheckoutBody {
  const b = body as Record<string, unknown>;
  return (
    typeof b?.borderSlug === 'string' &&
    typeof b?.borderName === 'string' &&
    typeof b?.templatedTemplateId === 'string' &&
    typeof b?.suiteSize === 'string' &&
    typeof b?.cardCount === 'number' &&
    typeof b?.amountPence === 'number'
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  if (contentType.includes('application/json')) {
    body = (await request.json()) as Record<string, unknown>;
  } else {
    const formData = await request.formData();
    body = {
      templateSlug: formData.get('templateSlug') ?? '',
      purchaseType: formData.get('purchaseType') ?? 'template',
    };
  }

  // Border purchase → Stripe (requires auth)
  if (isBorderCheckoutBody(body)) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!stripeSecret || !siteUrl) {
      return NextResponse.json(
        { error: 'Checkout not configured' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 });
    }

    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${body.borderName} — ${body.suiteSize}`,
            },
            unit_amount: body.amountPence,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/studio?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/borders/${body.borderSlug}`,
      metadata: {
        borderSlug: body.borderSlug,
        borderName: body.borderName,
        templatedTemplateId: body.templatedTemplateId,
        suiteSize: body.suiteSize,
        cardCount: String(body.cardCount),
        user_id: authSession.user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  }

  // Existing template/print flow
  const templateSlug = String(body.templateSlug ?? '');
  const purchaseType = (body.purchaseType as PurchaseType) || 'template';
  if (!templateSlug || !['template', 'print'].includes(purchaseType)) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  if (purchaseType === 'template') {
    return NextResponse.redirect(
      new URL(`/download?orderId=ord_${templateSlug}_${Date.now()}`, request.url)
    );
  }

  const order = createPrintOrder(templateSlug);
  return NextResponse.redirect(
    new URL(`/account?printOrder=${order.id}`, request.url)
  );
}
