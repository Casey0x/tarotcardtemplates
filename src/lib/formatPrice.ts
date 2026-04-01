import { convertPrice } from '@/lib/convertCurrency';

/**
 * Format a numeric amount already in `currency` units.
 * USD → $15.95, AUD → A$24.00, NZD → NZ$26.00
 */
export function formatPrice(amount: number, currency: string): string {
  const fixed = amount.toFixed(2);
  const c = currency.toUpperCase();
  if (c === 'USD') return `$${fixed}`;
  if (c === 'AUD') return `A$${fixed}`;
  if (c === 'NZD') return `NZ$${fixed}`;
  return `$${fixed}`;
}

/** Convert USD (stored value) and format for display in the given currency. */
export function formatUsdAsLocalCurrency(amountUSD: number, currency: string): string {
  return formatPrice(convertPrice(amountUSD, currency), currency);
}
