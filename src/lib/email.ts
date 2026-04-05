import { Resend } from 'resend';
import { getEmailFrom, getEmailReplyTo } from '@/lib/email-env';

export type SendPurchaseEmailParams = {
  to: string;
  customerName: string;
  productName: string;
  downloadUrl?: string;
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

/** Safe href for email HTML (http/https only). */
function safeHttpUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return '#';
    }
    return u.href;
  } catch {
    return '#';
  }
}

function buildPurchaseEmailHtml(params: SendPurchaseEmailParams): string {
  const name = escapeHtml(params.customerName);
  const product = escapeHtml(params.productName);
  const downloadHref =
    params.downloadUrl != null && params.downloadUrl.length > 0
      ? safeHttpUrl(params.downloadUrl)
      : '';
  const downloadSection =
    downloadHref !== '#'
      ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="border-radius:8px;background:#1a1a1a;">
            <a href="${downloadHref.replace(/"/g, '&quot;')}" style="display:inline-block;padding:14px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#faf8f5;text-decoration:none;">
              Download your files
            </a>
          </td>
        </tr>
      </table>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your order</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(26,26,26,0.08);overflow:hidden;">
          <tr>
            <td style="padding:36px 32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#1a1a1a;line-height:1.4;">
                Hi ${name},
              </p>
              <p style="margin:0 0 12px;font-size:15px;color:#3d3d3d;line-height:1.6;">
                Thank you for your purchase. Your order for <strong style="color:#1a1a1a;">${product}</strong> is ready.
              </p>
              ${downloadSection}
              <p style="margin:24px 0 0;font-size:14px;color:#5c5c5c;line-height:1.6;">
                If you have any issues, reply to this email — we’re happy to help.
              </p>
              <p style="margin:28px 0 0;font-size:13px;color:#8a8a8a;line-height:1.5;">
                — Tarot Card Templates
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a transactional “order ready” email via Resend.
 * Requires RESEND_API_KEY, EMAIL_FROM, and EMAIL_REPLY_TO in the environment.
 */
export async function sendPurchaseEmail(params: SendPurchaseEmailParams): Promise<{ id: string | undefined }> {
  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    replyTo,
    subject: 'Your order is ready ✨',
    html: buildPurchaseEmailHtml(params),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}
