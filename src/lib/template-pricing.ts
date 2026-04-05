import type { SupportedCurrency } from '@/lib/getUserCurrency';
import { formatPrice } from '@/lib/formatPrice';

/** Fixed digital template list prices per region (not FX conversion). */
const TEMPLATE_PRICE_USD = 14.95;
const TEMPLATE_PRICE_NZD = 24.95;
const TEMPLATE_PRICE_AUD = 22.95;

/** Border template list price (PNG/PSD/Canva pack) per region. */
const BORDER_LIST_PRICE_USD = 8.95;
const BORDER_LIST_PRICE_NZD = 14.95;
const BORDER_LIST_PRICE_AUD = 13.95;

/** Printed deck from template — fixed regional prices. */
const PRINTED_DECK_PRICE_USD = 23.95;
const PRINTED_DECK_PRICE_NZD = 39.95;
const PRINTED_DECK_PRICE_AUD = 36.95;

function priceForRegion(
  currency: string,
  usd: number,
  nzd: number,
  aud: number,
): number {
  const c = currency.toUpperCase();
  if (c === 'NZD') return nzd;
  if (c === 'AUD') return aud;
  return usd;
}

/**
 * Fixed template download price in the shopper's display currency.
 * US → 14.95 USD, NZ → 24.95 NZD, AU → 22.95 AUD.
 */
export function getTemplatePriceByCurrency(currency: string): number {
  return priceForRegion(currency, TEMPLATE_PRICE_USD, TEMPLATE_PRICE_NZD, TEMPLATE_PRICE_AUD);
}

/** Border list price: USD 8.95, NZD 14.95, AUD 13.95. */
export function getBorderListPriceByCurrency(currency: string): number {
  return priceForRegion(currency, BORDER_LIST_PRICE_USD, BORDER_LIST_PRICE_NZD, BORDER_LIST_PRICE_AUD);
}

/** Printed deck from template: USD 23.95, NZD 39.95, AUD 36.95. */
export function getPrintedDeckPriceByCurrency(currency: string): number {
  return priceForRegion(currency, PRINTED_DECK_PRICE_USD, PRINTED_DECK_PRICE_NZD, PRINTED_DECK_PRICE_AUD);
}

/** Formatted label for UI + JSON-LD digital template offer. */
export function formatTemplatePriceDisplay(currency: SupportedCurrency): string {
  return formatPrice(getTemplatePriceByCurrency(currency), currency);
}

export function formatBorderListPriceDisplay(currency: SupportedCurrency): string {
  return formatPrice(getBorderListPriceByCurrency(currency), currency);
}

export function formatPrintedDeckPriceDisplay(currency: SupportedCurrency): string {
  return formatPrice(getPrintedDeckPriceByCurrency(currency), currency);
}
