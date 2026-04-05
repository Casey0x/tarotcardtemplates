/**
 * Resend / transactional email addresses from the environment.
 * EMAIL_REPLY_TO is the team inbox: used as Reply-To on customer-facing mail
 * and as the To: address for internal notifications (e.g. quote requests).
 *
 * Call these only from request handlers or functions invoked by them — not at
 * module load time — so `process.env` is populated in serverless (Netlify/Vercel).
 */

function readEnv(name: 'EMAIL_FROM' | 'EMAIL_REPLY_TO'): string | undefined {
  return process.env[name]?.trim();
}

export function getEmailFrom(): string {
  const v = readEnv('EMAIL_FROM');
  if (!v) {
    throw new Error('EMAIL_FROM is not configured');
  }
  return v;
}

export function getEmailReplyTo(): string {
  const v = readEnv('EMAIL_REPLY_TO');
  if (!v) {
    throw new Error('EMAIL_REPLY_TO is not configured');
  }
  return v;
}
