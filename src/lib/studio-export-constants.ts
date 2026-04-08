/** Stripe Price IDs (test mode) for Studio PNG ZIP exports. */
export const STUDIO_EXPORT_STRIPE_PRICE = {
  major_arcana: 'price_1TJhk5Bfpg0Em1v98HtRZvqA',
  wands: 'price_1TJjhfBfpg0Em1v9KL4YCF15',
  cups: 'price_1TJjiZBfpg0Em1v9vBKrduYi',
  swords: 'price_1TJjjHBfpg0Em1v96M0I1qRS',
  pentacles: 'price_1TJjk7Bfpg0Em1v9BkrNN3pW',
  full_deck: 'price_1TJhnoBfpg0Em1v9kqQ3s7Xi',
} as const;

export type StudioExportType = keyof typeof STUDIO_EXPORT_STRIPE_PRICE;

/** The five suite-sized exports that together unlock full-deck ZIP (paid separately). */
export const STUDIO_SUITE_EXPORT_TYPES = [
  'major_arcana',
  'wands',
  'cups',
  'swords',
  'pentacles',
] as const satisfies readonly StudioExportType[];

export type StudioSuiteExportType = (typeof STUDIO_SUITE_EXPORT_TYPES)[number];

export function isStudioExportType(v: string): v is StudioExportType {
  return (
    v === 'major_arcana' ||
    v === 'wands' ||
    v === 'cups' ||
    v === 'swords' ||
    v === 'pentacles' ||
    v === 'full_deck'
  );
}

/** Inclusive card index ranges for each export ZIP (78-card deck). */
export const STUDIO_EXPORT_CARD_RANGE: Record<
  StudioExportType,
  { start: number; end: number }
> = {
  major_arcana: { start: 0, end: 21 },
  wands: { start: 22, end: 35 },
  cups: { start: 36, end: 49 },
  swords: { start: 50, end: 63 },
  pentacles: { start: 64, end: 77 },
  full_deck: { start: 0, end: 77 },
};

/** User paid for each of the five suite exports separately — full-deck ZIP is included. */
export function hasFullDeckUnlockedByAllSuitePurchases(exportTypes: Iterable<string>): boolean {
  const set = new Set(exportTypes);
  return STUDIO_SUITE_EXPORT_TYPES.every((t) => set.has(t));
}
