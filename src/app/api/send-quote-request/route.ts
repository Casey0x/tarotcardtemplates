import { NextResponse } from 'next/server';
import { sendQuoteRequestEmails } from '@/lib/email-quote';
import { parseQuoteRequestBody } from '@/lib/parse-quote-request-body';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseQuoteRequestBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status });
  }

  try {
    const result = await sendQuoteRequestEmails(parsed.params);
    return NextResponse.json({
      ok: true,
      staffEmailId: result.staffEmailId,
      customerEmailId: result.customerEmailId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send quote emails';
    console.error('[send-quote-request]', message, err instanceof Error ? err.stack : '');
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
