import { Resend } from 'resend';
import { getEmailFrom, getEmailReplyTo } from '@/lib/email-env';

export type SendQuoteRequestEmailsParams = {
  name: string;
  email: string;
  quantity: string;
  finish: string;
  shrinkWrap: string;
  specialRequirements?: string;
};

let resendClient: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeSubjectFragment(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim().slice(0, 180);
}

function buildStaffNotificationHtml(p: SendQuoteRequestEmailsParams): string {
  const rows: { label: string; value: string }[] = [
    { label: 'Name', value: p.name },
    { label: 'Email', value: p.email },
    { label: 'Quantity', value: p.quantity },
    { label: 'Finish preference', value: p.finish },
    { label: 'Shrink wrap', value: p.shrinkWrap },
  ];
  if (p.specialRequirements != null && p.specialRequirements.trim().length > 0) {
    rows.push({ label: 'Special requirements', value: p.specialRequirements.trim() });
  }

  const rowHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e8e4dc;font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#5c5348;width:38%;vertical-align:top;font-weight:600;">
        ${escapeHtml(r.label)}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #e8e4dc;font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#1a1814;vertical-align:top;">
        ${escapeHtml(r.value).replace(/\n/g, '<br />')}
      </td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(26,24,20,0.08);">
    <tr>
      <td style="padding:24px 24px 8px;font-family:system-ui,-apple-system,sans-serif;">
        <p style="margin:0;font-size:16px;font-weight:600;color:#1a1814;">New print quote request</p>
        <p style="margin:8px 0 0;font-size:13px;color:#6b6560;">Reply to this email to contact the customer directly.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 8px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:8px;overflow:hidden;">
          ${rowHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCustomerAutoReplyHtml(p: SendQuoteRequestEmailsParams): string {
  const name = escapeHtml(p.name);
  const qty = escapeHtml(p.quantity);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(26,24,20,0.08);">
    <tr>
      <td style="padding:32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#3d3d3d;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#1a1814;">Hi ${name},</p>
        <p style="margin:0 0 12px;">
          We&apos;ve received your quote request for <strong style="color:#1a1814;">${qty}</strong> deck${p.quantity.trim() === '1' ? '' : 's'}. Thank you for reaching out.
        </p>
        <p style="margin:0 0 12px;">
          We&apos;ll get back to you within one business day. If you need anything in the meantime, just reply to this email.
        </p>
        <p style="margin:24px 0 0;font-size:13px;color:#8a8a8a;">
          — Tarot Card Templates
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends staff notification (reply-to customer) and customer auto-reply via Resend.
 */
export async function sendQuoteRequestEmails(
  params: SendQuoteRequestEmailsParams,
): Promise<{ staffEmailId: string | undefined; customerEmailId: string | undefined }> {
  const from = getEmailFrom();
  const teamInbox = getEmailReplyTo();

  const resend = getResend();
  const subjectStaff = `New print quote request from ${safeSubjectFragment(params.name)}`;

  const { data: dataA, error: errA } = await resend.emails.send({
    from,
    to: teamInbox,
    replyTo: params.email.trim(),
    subject: subjectStaff,
    html: buildStaffNotificationHtml(params),
  });

  if (errA) {
    throw new Error(errA.message);
  }

  const { data: dataB, error: errB } = await resend.emails.send({
    from,
    to: params.email.trim(),
    replyTo: teamInbox,
    subject: "We've received your quote request ✨",
    html: buildCustomerAutoReplyHtml(params),
  });

  if (errB) {
    console.error('[sendQuoteRequestEmails] Customer auto-reply failed after staff notification sent:', errB.message);
    throw new Error(errB.message);
  }

  return {
    staffEmailId: dataA?.id,
    customerEmailId: dataB?.id,
  };
}
