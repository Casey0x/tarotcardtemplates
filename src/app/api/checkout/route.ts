import { NextResponse } from 'next/server';
import { createPrintOrder } from '@/lib/orders';

type PurchaseType = 'template' | 'print';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let templateSlug = '';
  let purchaseType: PurchaseType = 'template';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    templateSlug = body.templateSlug;
    purchaseType = body.purchaseType;
  } else {
    const formData = await request.formData();
    templateSlug = String(formData.get('templateSlug') || '');
    purchaseType = (String(formData.get('purchaseType')) as PurchaseType) || 'template';
  }

  if (!templateSlug || !['template', 'print'].includes(purchaseType)) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  // TODO: Replace this redirect behavior with Stripe Checkout session creation once keys are configured.
  if (purchaseType === 'template') {
    return NextResponse.redirect(new URL(`/download?orderId=ord_${templateSlug}_${Date.now()}`, request.url));
  }

  const order = createPrintOrder(templateSlug);
  return NextResponse.redirect(new URL(`/account?printOrder=${order.id}`, request.url));
}
