'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BorderPurchaseProps {
  borderSlug: string;
  borderName: string;
  isLoggedIn: boolean;
  ownsExport: boolean;
  /** Regional deck download price label (matches checkout). */
  deckDownloadPriceDisplay: string;
}

export function BorderPurchase({
  borderSlug,
  borderName,
  isLoggedIn,
  ownsExport,
  deckDownloadPriceDisplay,
}: BorderPurchaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginRedirect = `/auth/login?redirect=${encodeURIComponent(`/borders/${borderSlug}`)}`;
  const studioHref = `/studio-beta?border=${borderSlug}`;

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'deck_download',
          borderSlug,
          borderName,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = loginRedirect;
          return;
        }
        setError(data.error || 'Checkout failed');
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  if (ownsExport) {
    return (
      <div className="rounded-sm border border-green-200 bg-green-50 p-6">
        <p className="text-sm font-medium text-emerald-900">✓ Full deck export unlocked for this border</p>
        <Link
          href={studioHref}
          className="mt-4 inline-flex w-full items-center justify-center rounded-sm border border-emerald-800/30 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-950 transition hover:bg-emerald-100/80"
        >
          Open in Studio →
        </Link>
      </div>
    );
  }

  const tryButtonClass =
    'inline-flex min-h-[44px] flex-1 min-w-[10rem] items-center justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-3 text-center text-sm font-medium text-cream transition-colors hover:bg-charcoal/90';
  const purchaseOutlineClass =
    'inline-flex min-h-[44px] flex-1 min-w-[10rem] items-center justify-center rounded-sm border-2 border-charcoal bg-white px-4 py-3 text-center text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-cream';

  return (
    <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-charcoal">Full deck export — Studio</h2>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Link href={studioHref} className={tryButtonClass}>
            Try in Studio →
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={loading}
              className={`${purchaseOutlineClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {loading ? 'Redirecting to checkout…' : `Continue to checkout — ${deckDownloadPriceDisplay}`}
            </button>
          ) : (
            <Link href={loginRedirect} className={purchaseOutlineClass}>
              Sign in to continue
            </Link>
          )}
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <p className="text-sm text-charcoal/60">
          Preview your deck in Studio for free. Pay only when you&apos;re ready to export the full deck (ZIP).
        </p>
      </div>
    </div>
  );
}
