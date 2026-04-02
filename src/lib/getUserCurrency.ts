import { cookies, headers } from 'next/headers';
import {
  TCT_COUNTRY_COOKIE,
  countryCodeFromIncomingHeaders,
  countryFromLocaleTag,
} from '@/lib/request-country';

export type SupportedCurrency = 'USD' | 'AUD' | 'NZD';

export type UserCurrency = {
  currency: SupportedCurrency;
  /** Generic symbol; use `formatPrice` for locale-specific prefixes (A$, NZ$). */
  symbol: string;
};

/**
 * Map ISO 3166-1 alpha-2 country to display currency.
 * NZ → NZD, AU → AUD, else USD.
 */
export function countryCodeToCurrency(country: string | null | undefined): UserCurrency {
  const c = (country ?? '').trim().toUpperCase();
  if (c === 'NZ') return { currency: 'NZD', symbol: '$' };
  if (c === 'AU') return { currency: 'AUD', symbol: '$' };
  return { currency: 'USD', symbol: '$' };
}

/** @deprecated Use countryFromLocaleTag from request-country */
export function getCountryFromLocaleString(locale: string | null | undefined): string | null {
  return countryFromLocaleTag(locale);
}

/**
 * Resolve currency for the current request (server).
 * Priority: `x-detected-country` (middleware) → CDN headers → Accept-Language → `tct_country` cookie.
 *
 * For client components, pass the result from a parent server component to avoid
 * hydration mismatches. Optional: `getUserCurrencyFromNavigator()` after mount only.
 */
export function getUserCurrency(): UserCurrency {
  const headersList = headers();
  const pricingCookie = cookies().get(TCT_COUNTRY_COOKIE)?.value ?? null;
  return countryCodeToCurrency(countryCodeFromIncomingHeaders(headersList, pricingCookie));
}

/**
 * Client-only fallback using `navigator.language` (call after mount if needed).
 * Do not use during SSR — prefer `getUserCurrency()` on the server and pass down.
 */
export function getUserCurrencyFromNavigator(): UserCurrency {
  if (typeof navigator === 'undefined') {
    return { currency: 'USD', symbol: '$' };
  }
  return countryCodeToCurrency(countryFromLocaleTag(navigator.language));
}
