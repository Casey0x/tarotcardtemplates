import type { SupportedCurrency } from '@/lib/getUserCurrency';
import { formatPrice } from '@/lib/formatPrice';

/** Fixed digital template list prices per region (not FX conversion). */
const TEMPLATE_PRICE_USD = 14.95;
const TEMPLATE_PRICE_NZD = 24.95;
const TEMPLATE_PRICE_AUD = 22.95;

/**
 * Fixed template download price in the shopper's display currency.
 * US → 14.95 USD, NZ → 24.95 NZD, AU → 22.95 AUD.
 */
export function getTemplatePriceByCurrency(currency: string): number {
  const c = currency.toUpperCase();
  if (c === 'NZD') return TEMPLATE_PRICE_NZD;
  if (c === 'AUD') return TEMPLATE_PRICE_AUD;
  return TEMPLATE_PRICE_USD;
}

/** Formatted label for UI + JSON-LD digital template offer. */
export function formatTemplatePriceDisplay(currency: SupportedCurrency): string {
  return formatPrice(getTemplatePriceByCurrency(currency), currency);
}
