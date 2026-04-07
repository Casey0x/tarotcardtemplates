import type { SupportedCurrency } from '@/lib/getUserCurrency';
import { formatPrice, formatPriceWithCurrencyCode } from '@/lib/formatPrice';
import { regionalAmountForKind } from '@/lib/tct-price-region';

function supportedCheckoutCurrency(currency: string): SupportedCurrency {
  const c = currency.toUpperCase();
  if (c === 'NZD' || c === 'AUD') return c;
  return 'USD';
}

/**
 * Fixed template download price in the shopper's display currency.
 * US → 14.95 USD, NZ → 24.95 NZD, AU → 22.95 AUD.
 */
export function getTemplatePriceByCurrency(currency: string): number {
  return regionalAmountForKind('template', supportedCheckoutCurrency(currency));
}

/** Border list price: USD 8.95, NZD 14.95, AUD 13.95. */
export function getBorderListPriceByCurrency(currency: string): number {
  return regionalAmountForKind('border_list', supportedCheckoutCurrency(currency));
}

/** Printed deck from template: USD 23.95, NZD 39.95, AUD 36.95. */
export function getPrintedDeckPriceByCurrency(currency: string): number {
  return regionalAmountForKind('printed_deck', supportedCheckoutCurrency(currency));
}

/** Studio full-deck digital download: USD 8.95, NZD 14.95, AUD 13.95. */
export function getDeckDownloadPriceByCurrency(currency: string): number {
  return regionalAmountForKind('deck_download', supportedCheckoutCurrency(currency));
}

/** Formatted label for UI (includes ISO currency code). */
export function formatTemplatePriceDisplay(currency: SupportedCurrency): string {
  return formatPriceWithCurrencyCode(getTemplatePriceByCurrency(currency), currency);
}

export function formatBorderListPriceDisplay(currency: SupportedCurrency): string {
  return formatPriceWithCurrencyCode(getBorderListPriceByCurrency(currency), currency);
}

export function formatPrintedDeckPriceDisplay(currency: SupportedCurrency): string {
  return formatPriceWithCurrencyCode(getPrintedDeckPriceByCurrency(currency), currency);
}

export function formatDeckDownloadPriceDisplay(currency: SupportedCurrency): string {
  return formatPriceWithCurrencyCode(getDeckDownloadPriceByCurrency(currency), currency);
}

/** Symbol-only labels (e.g. compact buttons) — still use regional amounts. */
export function formatTemplatePriceSymbolOnly(currency: SupportedCurrency): string {
  return formatPrice(getTemplatePriceByCurrency(currency), currency);
}

export function formatPrintedDeckPriceSymbolOnly(currency: SupportedCurrency): string {
  return formatPrice(getPrintedDeckPriceByCurrency(currency), currency);
}
