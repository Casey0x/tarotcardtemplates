import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase-server';
import { getUserCurrency } from '@/lib/getUserCurrency';
import {
  buildCatalogCheckoutLineItem,
  buildStudioPrintedDeckLineItem,
} from '@/lib/stripe-catalog-price-ids';
import {
  getDeckDownloadPriceByCurrency,
  getPrintedDeckPriceByCurrency,
  getTemplatePriceByCurrency,
} from '@/lib/template-pricing';

type TemplatePurchaseType = 'template' | 'print';

interface DeckDownloadCheckoutBody {
  purchaseType: 'deck_download';
  borderSlug: string;
  borderName: string;
}

function isDeckDownloadCheckoutBody(body: unknown): body is DeckDownloadCheckoutBody {
  const b = body as Record<string, unknown>;
  return (
    b?.purchaseType === 'deck_download' &&
    typeof b?.borderSlug === 'string' &&
    typeof b?.borderName === 'string'
  );
}

/** Studio: printed deck shipped — same shipping rules as template print, no template row. */
function isStudioBorderPrintBody(body: Record<string, unknown>): boolean {
  const templateSlug = String(body.templateSlug ?? '').trim();
  return (
    body.purchaseType === 'print' &&
    typeof body.borderSlug === 'string' &&
    typeof body.borderName === 'string' &&
    body.borderSlug.length > 0 &&
    body.borderName.length > 0 &&
    !templateSlug
  );
}

async function requireAuthSession() {
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
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();
  return authSession;
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

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!stripeSecret || !siteUrl) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 });
  }

  if (isDeckDownloadCheckoutBody(body)) {
    const authSession = await requireAuthSession();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 });
    }

    const { currency } = getUserCurrency();
    const amount = getDeckDownloadPriceByCurrency(currency);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid price for this product' }, { status: 400 });
    }

    const unitAmount = Math.round(amount * 100);
    const stripeCurrency = currency.toLowerCase();
    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: `${body.borderName} — Deck download (Studio)`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/studio?session_id={CHECKOUT_SESSION_ID}&border=${encodeURIComponent(body.borderSlug)}`,
      cancel_url: `${siteUrl}/studio?border=${encodeURIComponent(body.borderSlug)}`,
      metadata: {
        purchaseType: 'deck_download',
        borderSlug: body.borderSlug,
        borderName: body.borderName,
        user_id: authSession.user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  }

  if (isStudioBorderPrintBody(body)) {
    const authSession = await requireAuthSession();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 });
    }

    const borderSlug = String(body.borderSlug);
    const borderName = String(body.borderName);

    const { currency } = getUserCurrency();
    const amount = getPrintedDeckPriceByCurrency(currency);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid price for this product' }, { status: 400 });
    }

    const lineItemName = `${borderName} — Printed deck (Studio)`;
    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        buildStudioPrintedDeckLineItem(currency, lineItemName, amount),
      ],
      mode: 'payment',
      customer_creation: 'always',
      success_url: `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/studio?border=${encodeURIComponent(borderSlug)}`,
      metadata: {
        purchaseType: 'print',
        studioPrint: '1',
        borderSlug,
        borderName,
        user_id: authSession.user.id,
        templateSlug: `studio-print:${borderSlug}`,
        templateName: lineItemName,
      },
      shipping_address_collection: {
        allowed_countries: ['NZ', 'AU', 'US'],
      },
    });

    return NextResponse.json({ url: session.url });
  }

  const templateSlug = String(body.templateSlug ?? '');
  const purchaseType = (body.purchaseType as TemplatePurchaseType) || 'template';
  if (!templateSlug || !['template', 'print'].includes(purchaseType)) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from('templates')
    .select('slug,name')
    .eq('slug', templateSlug)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const templateName = String(row.name);
  const { currency } = getUserCurrency();
  const amount =
    purchaseType === 'template'
      ? getTemplatePriceByCurrency(currency)
      : getPrintedDeckPriceByCurrency(currency);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid price for this product' }, { status: 400 });
  }

  const lineItemName =
    purchaseType === 'print' ? `${templateName} — Printed Deck` : templateName;

  const successUrl =
    purchaseType === 'template'
      ? `${siteUrl}/download?session_id={CHECKOUT_SESSION_ID}`
      : `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`;

  const stripe = new Stripe(stripeSecret);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      buildCatalogCheckoutLineItem(purchaseType, currency, lineItemName, amount),
    ],
    mode: 'payment',
    customer_creation: 'always',
    success_url: successUrl,
    cancel_url: `${siteUrl}/templates/${encodeURIComponent(templateSlug)}`,
    metadata: {
      templateSlug,
      purchaseType,
      templateName,
      ...(purchaseType === 'template'
        ? { orderReference: `TPL-${randomBytes(4).toString('hex').toUpperCase()}` }
        : {}),
    },
    ...(purchaseType === 'print'
      ? {
          shipping_address_collection: {
            allowed_countries: ['NZ', 'AU', 'US'],
          },
        }
      : {}),
  });

  return NextResponse.json({ url: session.url });
}
