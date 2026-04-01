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

/**
 * Infer AU/NZ from a BCP 47 tag (e.g. navigator.language or Accept-Language entry).
 */
export function getCountryFromLocaleString(locale: string | null | undefined): string | null {
  if (!locale?.trim()) return null;
  const tag = locale.trim();
  const m = tag.match(/[-_]([A-Za-z]{2})$/);
  if (!m) return null;
  const region = m[1].toUpperCase();
  if (region === 'NZ' || region === 'AU') return region;
  return null;
}

function getCountryFromHeaders(headersList: Headers): string | null {
  const vercel = headersList.get('x-vercel-ip-country');
  if (vercel?.trim()) return vercel.trim().toUpperCase();

  const cf = headersList.get('cf-ipcountry');
  if (cf?.trim()) return cf.trim().toUpperCase();

  const acceptLang = headersList.get('accept-language');
  if (acceptLang) {
    const parts = acceptLang.split(',').map((s) => s.split(';')[0].trim());
    for (const p of parts) {
      const fromLocale = getCountryFromLocaleString(p);
      if (fromLocale) return fromLocale;
    }
  }

  return null;
}

/**
 * Resolve currency for the current request (server).
 * Priority: IP/country headers → Accept-Language region (AU/NZ only).
 *
 * For client components, pass the result from a parent server component to avoid
 * hydration mismatches. Optional: `getUserCurrencyFromNavigator()` after mount only.
 */
export function getUserCurrency(headersList: Headers): UserCurrency {
  return countryCodeToCurrency(getCountryFromHeaders(headersList));
}

/**
 * Client-only fallback using `navigator.language` (call after mount if needed).
 * Do not use during SSR — prefer `getUserCurrency(headers)` on the server and pass down.
 */
export function getUserCurrencyFromNavigator(): UserCurrency {
  if (typeof navigator === 'undefined') {
    return { currency: 'USD', symbol: '$' };
  }
  return countryCodeToCurrency(getCountryFromLocaleString(navigator.language));
}
