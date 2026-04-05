import { cookies, headers } from 'next/headers';
import { countryCodeFromIncomingHeaders, countryFromLocaleTag } from '@/lib/request-country';

export type SupportedCurrency = 'USD' | 'AUD' | 'NZD';

export type UserCurrency = {
  currency: SupportedCurrency;
  /** Generic symbol; use `formatPrice` for locale-specific prefixes (A$, NZ$). */
  symbol: string;
};

/** Align with request-country: treat empty / unknown geo codes as absent. */
function normalizeCountryCode(raw: string | null | undefined): string | null {
  const v = raw?.trim().toUpperCase();
  if (!v || v === 'XX' || v === 'T1') return null;
  return v;
}

/**
 * Map ISO 3166-1 alpha-2 country to display currency.
 * NZ → NZD, AU → AUD, US → USD, else USD.
 */
export function countryCodeToCurrency(country: string | null | undefined): UserCurrency {
  const c = (country ?? '').trim().toUpperCase();
  if (c === 'NZ') return { currency: 'NZD', symbol: '$' };
  if (c === 'AU') return { currency: 'AUD', symbol: '$' };
  if (c === 'US') return { currency: 'USD', symbol: '$' };
  return { currency: 'USD', symbol: '$' };
}

/** @deprecated Use countryFromLocaleTag from request-country */
export function getCountryFromLocaleString(locale: string | null | undefined): string | null {
  return countryFromLocaleTag(locale);
}

/**
 * Resolve currency for the current request (server).
 *
 * Priority: `tct_country` cookie — if present, it overrides all header/geo detection.
 * Otherwise: `x-detected-country` → CDN headers → Accept-Language (see `countryCodeFromIncomingHeaders`).
 *
 * For client components, pass the result from a parent server component to avoid
 * hydration mismatches. Optional: `getUserCurrencyFromNavigator()` after mount only.
 */
export function getUserCurrency(): UserCurrency {
  const cookieRaw = cookies().get('tct_country')?.value;

  if (cookieRaw != null && cookieRaw.trim() !== '') {
    const normalized = normalizeCountryCode(cookieRaw);
    const result = countryCodeToCurrency(normalized);
    console.log('[getUserCurrency] tct_country cookie:', cookieRaw.trim());
    console.log('[getUserCurrency] final currency:', result.currency);
    return result;
  }

  const headersList = headers();
  const country = countryCodeFromIncomingHeaders(headersList, null);
  const result = countryCodeToCurrency(country);
  console.log('[getUserCurrency] tct_country cookie:', '(none)');
  console.log('[getUserCurrency] final currency:', result.currency);
  return result;
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
