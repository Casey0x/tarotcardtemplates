'use client';

import { DISPLAY_CURRENCY_OPTIONS, useTctCurrency, type DisplayCurrency } from '@/components/tct-currency-provider';

const LABELS: Record<DisplayCurrency, { flag: string; code: string }> = {
  USD: { flag: '🇺🇸', code: 'USD' },
  NZD: { flag: '🇳🇿', code: 'NZD' },
  AUD: { flag: '🇦🇺', code: 'AUD' },
  GBP: { flag: '🇬🇧', code: 'GBP' },
};

export function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useTctCurrency();

  return (
    <label
      className={`inline-flex items-center gap-1.5 text-xs text-charcoal/80 ${className}`.trim()}
      htmlFor="tct-currency-select"
    >
      <span className="sr-only">Display currency</span>
      <select
        id="tct-currency-select"
        value={displayCurrency}
        onChange={(e) => setDisplayCurrency(e.target.value as DisplayCurrency)}
        className="max-w-[11rem] cursor-pointer rounded-sm border border-charcoal/20 bg-cream py-1.5 pl-2 pr-7 text-xs font-medium text-charcoal shadow-sm transition-colors hover:border-charcoal/35 focus:border-charcoal/40 focus:outline-none focus:ring-1 focus:ring-charcoal/25"
        aria-label="Choose display currency (estimate only for some regions)"
      >
        {DISPLAY_CURRENCY_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {LABELS[code].flag} {LABELS[code].code}
          </option>
        ))}
      </select>
    </label>
  );
}
