/** Stripe Price IDs (test mode) for Studio PNG ZIP exports. */
export const STUDIO_EXPORT_STRIPE_PRICE = {
  major_arcana: 'price_1TJhk5Bfpg0Em1v98HtRZvqA',
  full_deck: 'price_1TJhnoBfpg0Em1v9kqQ3s7Xi',
} as const;

export type StudioExportType = keyof typeof STUDIO_EXPORT_STRIPE_PRICE;

export function isStudioExportType(v: string): v is StudioExportType {
  return v === 'major_arcana' || v === 'full_deck';
}
