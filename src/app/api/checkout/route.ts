import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase-server';

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
            currency: 'usd',
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

  // Template / print → Stripe (no auth)
  const templateSlug = String(body.templateSlug ?? '');
  const purchaseType = (body.purchaseType as PurchaseType) || 'template';
  if (!templateSlug || !['template', 'print'].includes(purchaseType)) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!stripeSecret || !siteUrl) {
    return NextResponse.json(
      { error: 'Checkout not configured' },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from('templates')
    .select('slug,name,template_price,print_price')
    .eq('slug', templateSlug)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }

  const templateName = String(row.name);
  const priceNzd =
    purchaseType === 'template'
      ? Number(row.template_price)
      : Number(row.print_price);
  if (!Number.isFinite(priceNzd) || priceNzd <= 0) {
    return NextResponse.json(
      { error: 'Invalid price for this product' },
      { status: 400 }
    );
  }

  const unitAmount = Math.round(priceNzd * 100);
  const lineItemName =
    purchaseType === 'print'
      ? `${templateName} — Printed Deck`
      : templateName;

  const successUrl =
    purchaseType === 'template'
      ? `${siteUrl}/download?session_id={CHECKOUT_SESSION_ID}`
      : `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`;

  const stripe = new Stripe(stripeSecret);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'nzd',
          product_data: {
            name: lineItemName,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: `${siteUrl}/templates/${encodeURIComponent(templateSlug)}`,
    metadata: {
      templateSlug,
      purchaseType,
      templateName,
    },
  });

  return NextResponse.json({ url: session.url });
}
