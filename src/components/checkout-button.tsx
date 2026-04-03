'use client';

import { useState } from 'react';

type PurchaseType = 'template' | 'print';

export type CheckoutButtonProps = {
  templateSlug: string;
  purchaseType: PurchaseType;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  /** Button text (default: “Continue to checkout”). Use for compact bars, e.g. price-only. */
  buttonText?: string;
  className?: string;
  buttonClassName?: string;
};

export function CheckoutButton({
  templateSlug,
  purchaseType,
  label,
  sublabel,
  buttonText = 'Continue to checkout',
  className = 'space-y-2 border border-charcoal/10 p-4',
  buttonClassName = 'w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/90 transition-colors disabled:opacity-60',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateSlug, purchaseType }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {label != null && <div className="font-medium">{label}</div>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={buttonClassName}
      >
        {loading ? 'Redirecting…' : buttonText}
      </button>
      {sublabel != null && <p className="mt-2 text-sm text-neutral-500">{sublabel}</p>}
    </div>
  );
}
