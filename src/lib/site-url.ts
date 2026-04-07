/** Site origin for Stripe redirects and absolute links (no trailing slash). */
export function getPublicSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (!raw) {
    throw new Error('Set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_BASE_URL for Stripe redirects.');
  }
  return raw;
}
