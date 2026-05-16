/** Matches instant-quote-section calculator: USD baseline, slider cap 100. */
export const CUSTOM_PRINTING_MAX_ESTIMATE_QTY = 100;

export const CUSTOM_PRINTING_PROTOTYPE_FLAT_USD = 78;

export function clampCustomPrintingDeckQty(n: number): number {
  return Math.min(CUSTOM_PRINTING_MAX_ESTIMATE_QTY, Math.max(1, Math.floor(n) || 1));
}

/**
 * Per-deck USD rate for qty ≥ 2 (prototype is flat total only).
 * Tiers: 2–9 @ 23.95, 10–19 @ …; same as published scale.
 */
function baseRatePerDeckUsd(qty: number): number {
  if (qty <= 1) return 0;
  if (qty >= 2 && qty < 10) return 23.95;
  if (qty >= 10 && qty < 20) return 21.95;
  if (qty >= 20 && qty < 50) return 19.95;
  return 15.95;
}

/** Total USD for custom-printing estimate (used by calculator + checkout validation). */
export function getCustomPrintingTotalUsd(deckQty: number): number {
  const q = clampCustomPrintingDeckQty(deckQty);
  if (q === 1) return CUSTOM_PRINTING_PROTOTYPE_FLAT_USD;
  return baseRatePerDeckUsd(q) * q;
}

/** Snapshot for UI (per-deck line items, prototype flag). */
export function getCustomPrintingEstimate(deckQty: number) {
  const qty = clampCustomPrintingDeckQty(deckQty);
  if (qty === 1) {
    return {
      qty,
      isPrototype: true as const,
      perDeck: CUSTOM_PRINTING_PROTOTYPE_FLAT_USD,
      total: CUSTOM_PRINTING_PROTOTYPE_FLAT_USD,
      basePerDeck: CUSTOM_PRINTING_PROTOTYPE_FLAT_USD,
    };
  }
  const base = baseRatePerDeckUsd(qty);
  const perDeck = base;
  const total = perDeck * qty;
  return {
    qty,
    isPrototype: false as const,
    perDeck,
    total,
    basePerDeck: base,
  };
}
