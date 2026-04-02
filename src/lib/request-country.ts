import type { NextRequest } from 'next/server';

/**
 * Headers some CDNs / hosts set for visitor country (ISO 3166-1 alpha-2).
 * Not including `x-detected-country` — that is our normalized copy for downstream RSC.
 */
export const CDN_COUNTRY_HEADER_KEYS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-nf-country',
  'x-country-code',
  'cloudfront-viewer-country',
  'fastly-client-geo-country',
] as const;

function normalizeCountry(raw: string | null | undefined): string | null {
  const v = raw?.trim().toUpperCase();
  if (!v || v === 'XX' || v === 'T1') return null;
  return v;
}

/** Use in middleware: CDN/geo only (no Accept-Language). */
export function inferCountryFromEdgeRequest(request: NextRequest): string | null {
  for (const key of CDN_COUNTRY_HEADER_KEYS) {
    const c = normalizeCountry(request.headers.get(key));
    if (c) return c;
  }
  const geo = normalizeCountry(request.geo?.country ?? undefined);
  if (geo) return geo;
  return null;
}

/**
 * Infer AU/NZ from a BCP 47 tag (e.g. `en-NZ` in Accept-Language).
 */
export function countryFromLocaleTag(locale: string | null | undefined): string | null {
  if (!locale?.trim()) return null;
  const tag = locale.trim();
  const m = tag.match(/[-_]([A-Za-z]{2})$/);
  if (!m) return null;
  const region = m[1].toUpperCase();
  if (region === 'NZ' || region === 'AU') return region;
  return null;
}

/**
 * Full resolution for Server Components (`headers()`): normalized country header,
 * then CDN headers, then Accept-Language regions.
 */
export function countryCodeFromIncomingHeaders(headersList: Headers): string | null {
  const detected = normalizeCountry(headersList.get('x-detected-country'));
  if (detected) return detected;

  for (const key of CDN_COUNTRY_HEADER_KEYS) {
    const c = normalizeCountry(headersList.get(key));
    if (c) return c;
  }

  const acceptLang = headersList.get('accept-language');
  if (acceptLang) {
    const parts = acceptLang.split(',').map((s) => s.split(';')[0].trim());
    for (const p of parts) {
      const fromLocale = countryFromLocaleTag(p);
      if (fromLocale) return fromLocale;
    }
  }

  return null;
}
