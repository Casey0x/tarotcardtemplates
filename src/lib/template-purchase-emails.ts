import { Resend } from 'resend';
import { getEmailFrom, getEmailReplyTo } from '@/lib/email-env';

const SUPPORT_EMAIL = 'casey@tarotcardtemplates.com';

/** Internal order inbox; override with ORDER_NOTIFY_EMAIL if needed. */
export function getTemplateOrderNotifyEmail(): string {
  return process.env.ORDER_NOTIFY_EMAIL?.trim() || SUPPORT_EMAIL;
}

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

export async function sendTemplateOrderCustomerEmail(params: {
  to: string;
  productName: string;
  orderReference: string;
}): Promise<{ id: string | undefined }> {
  const { to, productName, orderReference } = params;
  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();
  const resend = getResend();

  const p = escapeHtml(productName);
  const ref = escapeHtml(orderReference);

  const text = `Thank you for your purchase of ${productName}!

Your order reference is: #${orderReference}

To receive your files please reply to this email or contact us at:
${SUPPORT_EMAIL}

We'll send your files within 24 hours.

Thank you,
Tarot Card Templates`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:#3d3d3d;">
        <p style="margin:0 0 16px;">Thank you for your purchase of <strong style="color:#1a1814;">${p}</strong>!</p>
        <p style="margin:0 0 20px;">Your order reference is: <strong style="color:#1a1814;">#${ref}</strong></p>
        <p style="margin:0 0 16px;">To receive your files please reply to this email or contact us at:</p>
        <p style="margin:0 0 20px;"><a href="mailto:${SUPPORT_EMAIL}" style="color:#1a1814;font-weight:600;">${SUPPORT_EMAIL}</a></p>
        <p style="margin:0 0 20px;">We&apos;ll send your files within <strong style="color:#1a1814;">24 hours</strong>.</p>
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
    subject: `Your Tarot Card Templates Order #${orderReference}`,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { id: data?.id };
}

export async function sendTemplateOrderOwnerEmail(params: {
  customerName: string;
  customerEmail: string;
  productName: string;
  orderReference: string;
  stripeSessionId: string;
}): Promise<{ id: string | undefined }> {
  const { customerName, customerEmail, productName, orderReference, stripeSessionId } = params;
  const from = getEmailFrom();
  const replyTo = getEmailReplyTo();
  const notifyTo = getTemplateOrderNotifyEmail();
  const resend = getResend();

  const text = `New template order

Customer name: ${customerName}
Customer email: ${customerEmail}
Product purchased: ${productName}
Order reference: #${orderReference}
Stripe session ID: ${stripeSessionId}`;

  const cn = escapeHtml(customerName);
  const ce = escapeHtml(customerEmail);
  const pn = escapeHtml(productName);
  const ref = escapeHtml(orderReference);
  const sid = escapeHtml(stripeSessionId);
  const mailHref = `mailto:${customerEmail}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:28px 26px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#3d3d3d;">
        <p style="margin:0 0 16px;font-weight:600;color:#1a1814;">New template order</p>
        <p style="margin:0 0 6px;"><strong>Customer name:</strong> ${cn}</p>
        <p style="margin:0 0 6px;"><strong>Customer email:</strong> <a href="${escapeHtml(mailHref)}">${ce}</a></p>
        <p style="margin:0 0 6px;"><strong>Product purchased:</strong> ${pn}</p>
        <p style="margin:0 0 6px;"><strong>Order reference:</strong> #${ref}</p>
        <p style="margin:0 0 0;"><strong>Stripe session ID:</strong> ${sid}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from,
    to: notifyTo,
    replyTo,
    subject: `New Template Order #${orderReference}`,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { id: data?.id };
}
