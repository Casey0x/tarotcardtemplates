import { NextResponse } from 'next/server';
import { sendPurchaseEmail } from '@/lib/email';
import { getEmailReplyTo } from '@/lib/email-env';

export const runtime = 'nodejs';

/**
 * Dev-only: GET /api/test-email
 * Optional query: ?to=verified@example.com (defaults to EMAIL_REPLY_TO)
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  let defaultTo: string | undefined;
  try {
    defaultTo = getEmailReplyTo();
  } catch {
    defaultTo = undefined;
  }
  const to = searchParams.get('to')?.trim() || defaultTo;

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'Set ?to=email or EMAIL_REPLY_TO in .env.local' },
      { status: 400 }
    );
  }

  try {
    const result = await sendPurchaseEmail({
      to,
      customerName: 'Alex',
      productName: 'Sample Tarot Template (test)',
      downloadUrl: 'https://www.tarotcardtemplates.com/download?example=1',
    });
    return NextResponse.json({
      ok: true,
      id: result.id,
      to,
      message: 'Test email sent',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send test email';
    console.error('[test-email]', message, err instanceof Error ? err.stack : '');
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
