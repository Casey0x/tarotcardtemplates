import { NextResponse } from 'next/server';
import { sendPurchaseEmail, type SendPurchaseEmailParams } from '@/lib/email';

export const runtime = 'nodejs';

type Body = Partial<SendPurchaseEmailParams>;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { to, customerName, productName, downloadUrl } = body;

  if (!isNonEmptyString(to) || !isNonEmptyString(customerName) || !isNonEmptyString(productName)) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields: to, customerName, productName' },
      { status: 400 }
    );
  }

  try {
    const result = await sendPurchaseEmail({
      to: to.trim(),
      customerName: customerName.trim(),
      productName: productName.trim(),
      downloadUrl: typeof downloadUrl === 'string' && downloadUrl.trim().length > 0 ? downloadUrl.trim() : undefined,
    });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    console.error('[send-purchase-email]', message, err instanceof Error ? err.stack : '');
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
