import { Resend } from 'resend';
import { getEmailFrom, getEmailReplyTo } from '@/lib/email-env';

const SUPPORT_EMAIL = 'casey@tarotcardtemplates.com';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(key);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendCustomPrintingPrototypeConfirmationEmail(params: {
  to: string;
  stripeSessionId?: string;
}): Promise<{ id: string | undefined }> {
  const { to, stripeSessionId } = params;
  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();
  const resend = getResend();
  const ref = stripeSessionId?.trim() ? escapeHtml(stripeSessionId.trim()) : null;

  const text = `Thank you for your custom printing order!

Someone from our team will be in touch within 24 hours to help turn your deck into reality.

If you have questions in the meantime, reply to this email or write to ${SUPPORT_EMAIL}.

Thank you,
Tarot Card Templates${ref ? `\n\nReference: ${stripeSessionId}` : ''}`;

  const refBlock = ref
    ? `<p style="margin:20px 0 0;padding:14px 16px;border-radius:8px;border:1px solid #e8e4dc;background:#faf8f5;font-size:13px;color:#5c5348;"><strong style="color:#1a1814;">Reference:</strong> <span style="font-family:ui-monospace,monospace;">${ref}</span></p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:#3d3d3d;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#1a1814;">Thank you for your order!</p>
        <p style="margin:0 0 12px;">Someone from our team will be in touch within <strong style="color:#1a1814;">24 hours</strong> to help turn your deck into reality.</p>
        <p style="margin:0 0 12px;">If you have questions in the meantime, reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#1a1814;font-weight:600;">${SUPPORT_EMAIL}</a>.</p>
        ${refBlock}
        <p style="margin:24px 0 0;font-size:13px;color:#6b6560;">Thank you,<br />Tarot Card Templates</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: 'We received your custom printing order',
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { id: data?.id };
}

export async function sendCustomPrintingPrototypeOrderReceivedStaffEmail(params: {
  customerEmail: string;
  deckQty: string;
  amountPaidDisplay: string;
  stripeSessionId?: string;
}): Promise<{ id: string | undefined }> {
  const { customerEmail, deckQty, amountPaidDisplay, stripeSessionId } = params;
  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();
  const notifyTo = getEmailReplyTo();
  const resend = getResend();

  const ce = escapeHtml(customerEmail);
  const dq = escapeHtml(deckQty);
  const amt = escapeHtml(amountPaidDisplay);
  const sid = stripeSessionId ? escapeHtml(stripeSessionId) : '—';

  const text = `New custom printing order received

Customer email: ${customerEmail}
Deck quantity: ${deckQty}
Amount paid (NZD): ${amountPaidDisplay}
Stripe session: ${stripeSessionId ?? '—'}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 26px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#3d3d3d;">
        <p style="margin:0 0 16px;font-weight:600;color:#1a1814;">New custom printing order received</p>
        <p style="margin:0 0 6px;"><strong>Customer email:</strong> ${ce}</p>
        <p style="margin:0 0 6px;"><strong>Deck quantity:</strong> ${dq}</p>
        <p style="margin:0 0 6px;"><strong>Amount paid (NZD):</strong> ${amt}</p>
        <p style="margin:0 0 0;"><strong>Stripe session:</strong> ${sid}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from,
    to: notifyTo,
    replyTo,
    subject: 'New custom printing order received',
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { id: data?.id };
}
