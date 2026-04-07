import {
  TCT_FX_RATES_STORAGE_KEY,
  TCT_FX_RATES_TTL_MS,
} from '@/lib/tct-display-currency';

const FRANKFURTER_USD_LATEST = 'https://api.frankfurter.app/latest?from=USD';

export type FxRatesMap = Record<string, number>;

export async function fetchUsdQuoteRates(): Promise<FxRatesMap> {
  const res = await fetch(FRANKFURTER_USD_LATEST);
  if (!res.ok) throw new Error('Frankfurter rates request failed');
  const data = (await res.json()) as { rates: Record<string, number> };
  return { USD: 1, ...data.rates };
}

export function readCachedFxRatesFromStorage(): { rates: FxRatesMap; stale: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TCT_FX_RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; r: FxRatesMap };
    if (!parsed?.r || typeof parsed.t !== 'number') return null;
    return { rates: parsed.r, stale: Date.now() - parsed.t > TCT_FX_RATES_TTL_MS };
  } catch {
    return null;
  }
}

export function writeCachedFxRatesToStorage(rates: FxRatesMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TCT_FX_RATES_STORAGE_KEY, JSON.stringify({ t: Date.now(), r: rates }));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Loads cached FX when fresh; otherwise fetches and caches (24h TTL). Safe fallbacks if offline. */
export async function getFxRatesForBrowser(): Promise<FxRatesMap> {
  const cached = readCachedFxRatesFromStorage();
  if (cached && !cached.stale) return cached.rates;

  try {
    const fresh = await fetchUsdQuoteRates();
    writeCachedFxRatesToStorage(fresh);
    return fresh;
  } catch {
    if (cached?.rates) return cached.rates;
    return { USD: 1, NZD: 1.65, AUD: 1.55, GBP: 0.79 };
  }
}
