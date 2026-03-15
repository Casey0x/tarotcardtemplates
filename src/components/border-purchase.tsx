'use client';

import { useState } from 'react';
import Link from 'next/link';

type SuiteSize = 'single' | 'major' | 'full';

const PRICING: { id: SuiteSize; label: string; cardCount: number; amountPence: number }[] = [
  { id: 'single', label: 'Single card', cardCount: 1, amountPence: 299 },
  { id: 'major', label: 'Major Arcana (22 cards)', cardCount: 22, amountPence: 1999 },
  { id: 'full', label: 'Full deck (78 cards)', cardCount: 78, amountPence: 4999 },
];

interface BorderPurchaseProps {
  borderSlug: string;
  borderName: string;
  templatedTemplateId: string | null;
}

export function BorderPurchase({ borderSlug, borderName, templatedTemplateId }: BorderPurchaseProps) {
  const [suiteSize, setSuiteSize] = useState<SuiteSize>('major');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const option = PRICING.find((p) => p.id === suiteSize)!;
  const canPurchase = !!templatedTemplateId;

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
          window.location.href = `/auth/login?redirect=${encodeURIComponent(`/borders/${borderSlug}`)}`;
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

  return (
    <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-charcoal">
        Border Template — Studio
      </h2>
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
                    £{(p.amountPence / 100).toFixed(2)}
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
            onClick={handlePurchase}
            disabled={loading}
            className="border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream hover:bg-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Redirecting to checkout…' : 'Purchase'}
          </button>
          <p className="mt-2 text-xs text-charcoal/70">
            After payment you’ll design each card in the Studio.
          </p>
        </>
      ) : (
        <>
          <p className="mb-4 text-charcoal/90">
            <span className="font-medium">Price: $9.95</span> — Studio designer coming soon for this border.
          </p>
          <p className="mb-2 text-sm font-medium text-charcoal/80">Includes:</p>
          <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-charcoal/80">
            <li>PNG border</li>
            <li>PSD layered file</li>
            <li>Canva compatible</li>
            <li>70×120mm tarot card size</li>
            <li>3mm bleed included</li>
          </ul>
          <Link
            href="/auth/login"
            className="inline-block border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
          >
            Sign in to purchase
          </Link>
        </>
      )}
    </div>
  );
}
