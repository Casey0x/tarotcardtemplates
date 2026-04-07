export type DisplayCurrency = 'USD' | 'NZD' | 'AUD' | 'GBP';

export const DISPLAY_CURRENCY_OPTIONS: readonly DisplayCurrency[] = ['USD', 'NZD', 'AUD', 'GBP'];

export const TCT_DISPLAY_CURRENCY_STORAGE_KEY = 'tct_display_currency';

export const TCT_FX_RATES_STORAGE_KEY = 'tct_fx_rates_v1';

export const TCT_FX_RATES_TTL_MS = 24 * 60 * 60 * 1000;

export function isDisplayCurrency(v: string | null | undefined): v is DisplayCurrency {
  return v === 'USD' || v === 'NZD' || v === 'AUD' || v === 'GBP';
}

/** Map ISO country (ipapi / Intl region) to a display currency. */
export function displayCurrencyFromCountryCode(code: string | null | undefined): DisplayCurrency {
  const c = (code ?? '').trim().toUpperCase();
  if (c === 'NZ') return 'NZD';
  if (c === 'AU') return 'AUD';
  if (c === 'US') return 'USD';
  if (c === 'GB') return 'GBP';
  return 'USD';
}

/**
 * Convert a USD amount to the selected display currency using Frankfurter USD→X rates.
 * Used for estimates (e.g. printing calculator); catalog SKUs use fixed regional prices instead.
 */
export function convertUsdAmountForDisplay(
  usd: number,
  display: DisplayCurrency,
  ratesFromUsd: Record<string, number>,
): number {
  if (!Number.isFinite(usd)) return usd;
  const rounded = Math.round(usd * 100) / 100;
  if (display === 'USD') return rounded;
  const mult = ratesFromUsd[display];
  if (typeof mult === 'number' && mult > 0) return Math.round(usd * mult * 100) / 100;
  return rounded;
}
