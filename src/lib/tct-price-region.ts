import type { DisplayCurrency } from '@/lib/tct-display-currency';
import type { SupportedCurrency } from '@/lib/getUserCurrency';

export type TctPriceKind = 'template' | 'border_list' | 'printed_deck' | 'deck_download';

/** Fixed list prices by region (same numbers as Stripe checkout for USD/NZD/AUD). */
export const TCT_PRICE_REGIONAL: Record<
  TctPriceKind,
  { USD: number; NZD: number; AUD: number }
> = {
  template: { USD: 14.95, NZD: 24.95, AUD: 22.95 },
  border_list: { USD: 8.95, NZD: 14.95, AUD: 13.95 },
  printed_deck: { USD: 23.95, NZD: 39.95, AUD: 36.95 },
  deck_download: { USD: 8.95, NZD: 14.95, AUD: 13.95 },
};

export function regionalAmountForKind(kind: TctPriceKind, currency: SupportedCurrency): number {
  const row = TCT_PRICE_REGIONAL[kind];
  return row[currency];
}

/**
 * Amount shown for a catalog line item in the UI. USD/NZD/AUD use fixed regional prices;
 * GBP is approximate from USD × ECB (Frankfurter) rate.
 */
export function displayAmountForTctKind(
  kind: TctPriceKind,
  display: DisplayCurrency,
  ratesFromUsd: Record<string, number>,
): number {
  const row = TCT_PRICE_REGIONAL[kind];
  if (display === 'USD') return row.USD;
  if (display === 'NZD') return row.NZD;
  if (display === 'AUD') return row.AUD;
  if (display === 'GBP') {
    const gbp = ratesFromUsd.GBP;
    if (typeof gbp === 'number' && gbp > 0) return Math.round(row.USD * gbp * 100) / 100;
    return row.USD;
  }
  return row.USD;
}
