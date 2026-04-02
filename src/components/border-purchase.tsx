'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SupportedCurrency } from '@/lib/getUserCurrency';
import { formatUsdAsLocalCurrency } from '@/lib/formatPrice';

type SuiteSize = 'single' | 'major' | 'full';

/** Stripe `unit_amount` (USD cents) per tier. */
const PRICING: { id: SuiteSize; label: string; cardCount: number; amountPence: number }[] = [
  { id: 'single', label: 'Single card', cardCount: 1, amountPence: 299 },
  { id: 'major', label: 'Major Arcana (22 cards)', cardCount: 22, amountPence: 895 },
  { id: 'full', label: 'Full deck (78 cards)', cardCount: 78, amountPence: 4999 },
];

interface BorderPurchaseProps {
  borderSlug: string;
  borderName: string;
  templatedTemplateId: string | null;
  isLoggedIn: boolean;
  ownsBorder: boolean;
  /** Localized list price for copy when checkout tiers are unavailable (USD base from DB). */
  listPriceDisplay: string;
  currency: SupportedCurrency;
}

export function BorderPurchase({
  borderSlug,
  borderName,
  templatedTemplateId,
  isLoggedIn,
  ownsBorder,
  listPriceDisplay,
  currency,
}: BorderPurchaseProps) {
  const [suiteSize, setSuiteSize] = useState<SuiteSize>('major');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const option = PRICING.find((p) => p.id === suiteSize)!;
  const canPurchase = !!templatedTemplateId;
  const loginRedirect = `/auth/login?redirect=${encodeURIComponent(`/borders/${borderSlug}`)}`;
  const studioHref = `/studio-beta?border=${borderSlug}`;

  async function handlePurchase() {
    if (!templatedTemplateId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borderSlug,
          borderName,
          templatedTemplateId,
          suiteSize: option.label,
          cardCount: option.cardCount,
          amountPence: option.amountPence,
        }),
      });
      const data = await res.json();
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

  if (ownsBorder) {
    return (
      <div className="rounded-sm border border-green-200 bg-green-50 p-6">
        <p className="text-sm font-medium text-emerald-900">✓ You own this border</p>
        <Link
          href={studioHref}
          className="mt-4 inline-flex w-full items-center justify-center rounded-sm border border-emerald-800/30 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-950 transition hover:bg-emerald-100/80"
        >
          Open in Studio →
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Border Template — Studio</h2>
        {canPurchase ? (
          <>
            <p className="mb-2 text-sm font-medium text-charcoal/80">Choose size:</p>
            <ul className="mb-4 space-y-2">
              {PRICING.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="suiteSize"
                      checked={suiteSize === p.id}
                      onChange={() => setSuiteSize(p.id)}
                      className="text-charcoal"
                    />
                    <span className="text-charcoal">{p.label}</span>
                    <span className="text-charcoal/70">
                      {formatUsdAsLocalCurrency(p.amountPence / 100, currency)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mb-4 text-xs text-charcoal/70">Sign in to continue to secure checkout for your selection.</p>
          </>
        ) : (
          <>
            <p className="mb-4 text-charcoal/90">
              <span className="font-medium">Price: {listPriceDisplay}</span> — Includes PNG, PSD, and Canva-compatible
              files. Use the Studio after purchase to place your artwork in the frame.
            </p>
            <p className="mb-2 text-sm font-medium text-charcoal/80">Includes:</p>
            <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-charcoal/80">
              <li>PNG border</li>
              <li>PSD layered file</li>
              <li>Canva compatible</li>
              <li>70×120mm tarot card size</li>
              <li>3mm bleed included</li>
            </ul>
          </>
        )}
        <Link
          href={loginRedirect}
          className="inline-block border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/90"
        >
          Sign in to purchase
        </Link>
      </div>
    );
  }

  // Logged in, does not own
  return (
    <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-charcoal">Border Template — Studio</h2>
      {canPurchase ? (
        <>
          <p className="mb-2 text-sm font-medium text-charcoal/80">Choose size:</p>
          <ul className="mb-4 space-y-2">
            {PRICING.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="suiteSize"
                    checked={suiteSize === p.id}
                    onChange={() => setSuiteSize(p.id)}
                    className="text-charcoal"
                  />
                  <span className="text-charcoal">{p.label}</span>
                  <span className="text-charcoal/70">
                    {formatUsdAsLocalCurrency(p.amountPence / 100, currency)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {error && (
            <p className="mb-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handlePurchase()}
            disabled={loading}
            className="border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading
              ? 'Redirecting to checkout…'
              : `Purchase — ${formatUsdAsLocalCurrency(option.amountPence / 100, currency)}`}
          </button>
          <p className="mt-2 text-xs text-charcoal/70">After payment you’ll design each card in the Studio.</p>
        </>
      ) : (
        <>
          <p className="mb-4 text-charcoal/90">
            <span className="font-medium">Price: {listPriceDisplay}</span> — Includes PNG, PSD, and Canva-compatible
            files. Use the Studio after purchase to place your artwork in the frame.
          </p>
          <p className="mb-2 text-sm font-medium text-charcoal/80">Includes:</p>
            <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-charcoal/80">
              <li>PNG border</li>
              <li>PSD layered file</li>
              <li>Canva compatible</li>
              <li>70×120mm tarot card size</li>
              <li>3mm bleed included</li>
            </ul>
            <p className="mb-4 text-sm text-charcoal/75">
              Online checkout for this border is not available yet. You can still try the frame in the Studio.
            </p>
          <Link
            href={studioHref}
            className="inline-block border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/90"
          >
            Try in Studio →
          </Link>
        </>
      )}
    </div>
  );
}
