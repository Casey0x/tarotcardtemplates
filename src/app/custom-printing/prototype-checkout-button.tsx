'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTctCurrency } from '@/components/tct-currency-provider';
import { convertUsdAmountForDisplay, type DisplayCurrency } from '@/lib/tct-display-currency';
import { readCachedFxRatesFromStorage } from '@/lib/tct-fx-rates';

type Props = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Calculator baseline `estimate.total` (USD). */
  totalUsd: number;
  deckQty: number;
};

const RATES_RETRY_MESSAGE = 'Rates loading, please try again';

function resolveRates(fxRates: Record<string, number> | null): Record<string, number> | null {
  if (fxRates && Object.keys(fxRates).length > 0) {
    return fxRates;
  }
  const cached = readCachedFxRatesFromStorage();
  if (cached?.rates && Object.keys(cached.rates).length > 0) {
    return cached.rates;
  }
  return null;
}

function buildCheckoutPayload(
  totalUsd: number,
  displayCurrency: DisplayCurrency,
  fxRates: Record<string, number> | null,
):
  | { ok: true; amountCents: number; currency: string }
  | { ok: false; reason: 'invalid_total' | 'rates_unavailable' } {
  if (!Number.isFinite(totalUsd) || totalUsd <= 0) {
    return { ok: false, reason: 'invalid_total' };
  }

  const rates = resolveRates(fxRates);

  if (!rates) {
    if (displayCurrency === 'USD') {
      return { ok: true, amountCents: Math.round(totalUsd * 100), currency: 'usd' };
    }
    return { ok: false, reason: 'rates_unavailable' };
  }

  const major = convertUsdAmountForDisplay(totalUsd, displayCurrency, rates);
  return {
    ok: true,
    amountCents: Math.round(major * 100),
    currency: displayCurrency.toLowerCase(),
  };
}

export function PrototypeCheckoutButton({ className, style, children, totalUsd, deckQty }: Props) {
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { displayCurrency, fxRates } = useTctCurrency();

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  function showTransientMessage(message: string) {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    setStatusMessage(message);
    messageTimerRef.current = setTimeout(() => {
      setStatusMessage(null);
      messageTimerRef.current = null;
    }, 3500);
  }

  async function onCheckout() {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setStatusMessage(null);

    setBusy(true);
    try {
      const payload = buildCheckoutPayload(totalUsd, displayCurrency, fxRates);
      if (!payload.ok) {
        if (payload.reason === 'rates_unavailable') {
          showTransientMessage(RATES_RETRY_MESSAGE);
        }
        setBusy(false);
        return;
      }

      const { amountCents, currency } = payload;

      const res = await fetch('/api/checkout-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, currency, deckQty }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed');
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error('No checkout URL');
    } catch (e) {
      console.error('[checkout-prototype]', e);
      setBusy(false);
    }
  }

  const label = busy ? 'Redirecting…' : statusMessage ?? children;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onCheckout()}
      className={className}
      style={style}
    >
      {label}
    </button>
  );
}
