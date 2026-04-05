import { NextResponse } from 'next/server';
import { sendPurchaseEmail } from '@/lib/email';

/**
 * Dev-only: GET /api/test-email
 * Optional query: ?to=verified@example.com (defaults to EMAIL_REPLY_TO)
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to')?.trim() || process.env.EMAIL_REPLY_TO;

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
    console.error('[test-email]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
