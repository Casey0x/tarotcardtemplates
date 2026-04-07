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

/** e.g. `NZD NZ$24.95` — ISO code plus localized symbol for clarity. */
export function formatPriceWithCurrencyCode(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  return `${code} ${formatPrice(amount, code)}`;
}
