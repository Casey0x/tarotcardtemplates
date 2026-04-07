'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import type { SupportedCurrency } from '@/lib/getUserCurrency';
import {
  type DisplayCurrency,
  DISPLAY_CURRENCY_OPTIONS,
  TCT_DISPLAY_CURRENCY_STORAGE_KEY,
  convertUsdAmountForDisplay,
  displayCurrencyFromCountryCode,
  isDisplayCurrency,
} from '@/lib/tct-display-currency';
import { getFxRatesForBrowser } from '@/lib/tct-fx-rates';
import { applyTctPriceNodes } from '@/lib/tct-dom-price-sync';
import { formatPriceWithCurrencyCode } from '@/lib/formatPrice';

type TctCurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  fxRates: Record<string, number> | null;
  /** USD baseline → chosen display currency (FX), with ISO code prefix. */
  formatUsdEstimate: (usd: number) => string;
};

const TctCurrencyContext = createContext<TctCurrencyContextValue | null>(null);

function readStoredDisplayCurrency(): DisplayCurrency | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(TCT_DISPLAY_CURRENCY_STORAGE_KEY);
    return isDisplayCurrency(v) ? v : null;
  } catch {
    return null;
  }
}

function getInitialDisplayCurrency(server: SupportedCurrency): DisplayCurrency {
  const stored = readStoredDisplayCurrency();
  if (stored) return stored;
  return server;
}

function syncPricingCountryCookie(display: DisplayCurrency) {
  if (typeof document === 'undefined') return;
  if (display === 'NZD') {
    document.cookie = `tct_country=${encodeURIComponent('NZ')};path=/;max-age=31536000;SameSite=Lax`;
    return;
  }
  if (display === 'AUD') {
    document.cookie = `tct_country=${encodeURIComponent('AU')};path=/;max-age=31536000;SameSite=Lax`;
    return;
  }
  if (display === 'USD') {
    document.cookie = `tct_country=${encodeURIComponent('US')};path=/;max-age=31536000;SameSite=Lax`;
    return;
  }
  document.cookie = 'tct_country=;path=/;max-age=0';
}

async function fetchSuggestedCurrencyFromIp(): Promise<DisplayCurrency | null> {
  try {
    const ac = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(4500) : undefined;
    const res = await fetch('https://ipapi.co/json/', ac ? { signal: ac } : undefined);
    if (!res.ok) return null;
    const j = (await res.json()) as { country_code?: string };
    if (typeof j.country_code === 'string') {
      return displayCurrencyFromCountryCode(j.country_code);
    }
  } catch {
    /* network / CORS / timeout */
  }
  return null;
}

function intlSuggestedCurrency(): DisplayCurrency | null {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    const m = locale.match(/[-_]([A-Za-z]{2})$/);
    if (m) return displayCurrencyFromCountryCode(m[1]);
  } catch {
    /* ignore */
  }
  return null;
}

export function TctCurrencyProvider({
  serverPricingCurrency,
  children,
}: {
  serverPricingCurrency: SupportedCurrency;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() =>
    getInitialDisplayCurrency(serverPricingCurrency),
  );
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null);

  const setDisplayCurrency = useCallback((next: DisplayCurrency) => {
    setDisplayCurrencyState(next);
    try {
      localStorage.setItem(TCT_DISPLAY_CURRENCY_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('tct:display-currency', { detail: { currency: next } }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rates = await getFxRatesForBrowser();
      if (!cancelled) setFxRates(rates);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      if (isDisplayCurrency(localStorage.getItem(TCT_DISPLAY_CURRENCY_STORAGE_KEY))) {
        return;
      }
    } catch {
      /* unreadable storage — still try geo suggestion */
    }

    let cancelled = false;
    void (async () => {
      let suggested = await fetchSuggestedCurrencyFromIp();
      if (cancelled) return;
      if (!suggested) suggested = intlSuggestedCurrency();
      if (!suggested) return;
      if (readStoredDisplayCurrency()) return;
      setDisplayCurrency(suggested);
    })();
    return () => {
      cancelled = true;
    };
  }, [setDisplayCurrency]);

  useLayoutEffect(() => {
    syncPricingCountryCookie(displayCurrency);
  }, [displayCurrency]);

  useLayoutEffect(() => {
    if (!fxRates) return;
    applyTctPriceNodes(document, displayCurrency, fxRates);
  }, [displayCurrency, fxRates, pathname]);

  const formatUsdEstimate = useCallback(
    (usd: number) => {
      if (!fxRates) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usd);
      }
      const conv = convertUsdAmountForDisplay(usd, displayCurrency, fxRates);
      return formatPriceWithCurrencyCode(conv, displayCurrency);
    },
    [displayCurrency, fxRates],
  );

  const value = useMemo(
    () => ({ displayCurrency, setDisplayCurrency, fxRates, formatUsdEstimate }),
    [displayCurrency, setDisplayCurrency, fxRates, formatUsdEstimate],
  );

  return <TctCurrencyContext.Provider value={value}>{children}</TctCurrencyContext.Provider>;
}

export function useTctCurrency() {
  const ctx = useContext(TctCurrencyContext);
  if (!ctx) {
    throw new Error('useTctCurrency must be used within TctCurrencyProvider');
  }
  return ctx;
}

export { DISPLAY_CURRENCY_OPTIONS };
export type { DisplayCurrency };
