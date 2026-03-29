export type StudioPreviewItem = {
  slug: string;
  name: string;
  image: string;
  /** Transparent-center border PNG for live upload view; optional. */
  transparentImage?: string | null;
};

export type ResolvedStudioBorders = {
  dropdownBorders: StudioPreviewItem[];
  trialExhaustedNoPurchase: boolean;
};

/** Which borders appear in the Studio dropdown for this user/session. */
export function resolveStudioBorderOptions(
  all: StudioPreviewItem[],
  purchasedSlugs: string[],
  trialRendersUsed: number,
  isLoggedIn: boolean
): ResolvedStudioBorders {
  if (!isLoggedIn) {
    return { dropdownBorders: all, trialExhaustedNoPurchase: false };
  }
  if (trialRendersUsed < 2) {
    return { dropdownBorders: all, trialExhaustedNoPurchase: false };
  }
  if (purchasedSlugs.length === 0) {
    return { dropdownBorders: [], trialExhaustedNoPurchase: true };
  }
  const set = new Set(purchasedSlugs);
  return {
    dropdownBorders: all.filter((b) => set.has(b.slug)),
    trialExhaustedNoPurchase: false,
  };
}
