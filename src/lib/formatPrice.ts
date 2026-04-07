/**
 * Format a numeric amount already in `currency` units.
 * USD → $15.95, AUD → A$24.00, NZD → NZ$26.00, GBP → £12.00
 */
export function formatPrice(amount: number, currency: string): string {
  const fixed = amount.toFixed(2);
  const c = currency.toUpperCase();
  if (c === 'USD') return `$${fixed}`;
  if (c === 'AUD') return `A$${fixed}`;
  if (c === 'NZD') return `NZ$${fixed}`;
  if (c === 'GBP') return `£${fixed}`;
  return `$${fixed}`;
}

/**
 * Same as {@link formatPrice} — symbol only (e.g. NZ$24.95, $14.95, A$22.95, £11.80).
 * Kept under this name so existing call sites (template-pricing, DOM sync, provider) stay stable.
 */
export function formatPriceWithCurrencyCode(amount: number, currency: string): string {
  return formatPrice(amount, currency);
}
