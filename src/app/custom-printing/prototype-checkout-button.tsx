'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTctCurrency } from '@/components/tct-currency-provider';
import { convertUsdAmountForDisplay, type DisplayCurrency } from '@/lib/tct-display-currency';

type Props = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Calculator baseline `estimate.total` (USD). */
  totalUsd: number;
  deckQty: number;
};

function buildCheckoutPayload(
  totalUsd: number,
  displayCurrency: DisplayCurrency,
  fxRates: Record<string, number> | null,
): { amountCents: number; currency: string } {
  if (!Number.isFinite(totalUsd) || totalUsd <= 0) {
    return { amountCents: 0, currency: 'usd' };
  }
  if (!fxRates) {
    return { amountCents: Math.round(totalUsd * 100), currency: 'usd' };
  }
  const major = convertUsdAmountForDisplay(totalUsd, displayCurrency, fxRates);
  return {
    amountCents: Math.round(major * 100),
    currency: displayCurrency.toLowerCase(),
  };
}

export function PrototypeCheckoutButton({ className, style, children, totalUsd, deckQty }: Props) {
  const [busy, setBusy] = useState(false);
  const { displayCurrency, fxRates } = useTctCurrency();

  async function onCheckout() {
    setBusy(true);
    try {
      const { amountCents, currency } = buildCheckoutPayload(totalUsd, displayCurrency, fxRates);
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

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onCheckout()}
      className={className}
      style={style}
    >
      {busy ? 'Redirecting…' : children}
    </button>
  );
}
