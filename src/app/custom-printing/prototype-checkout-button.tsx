'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function PrototypeCheckoutButton({ className, style, children }: Props) {
  const [busy, setBusy] = useState(false);

  async function onCheckout() {
    setBusy(true);
    try {
      const res = await fetch('/api/checkout-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
