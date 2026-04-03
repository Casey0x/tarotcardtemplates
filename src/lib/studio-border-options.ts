export type StudioPreviewItem = {
  slug: string;
  name: string;
  image: string;
  /** Transparent-center border PNG for live upload view; optional. */
  transparentImage?: string | null;
  /** Unowned border opened via ?border= while trial renders remain. */
  isTrial?: boolean;
};

export type ResolvedStudioBorders = {
  dropdownBorders: StudioPreviewItem[];
  trialExhaustedNoPurchase: boolean;
  /** Logged-in, zero purchases, no valid trial ?border=, trial not exhausted — show browse CTA. */
  noPurchasedBordersEmpty: boolean;
};

/** Which borders appear in the Studio dropdown for this user/session. */
export function resolveStudioBorderOptions(
  all: StudioPreviewItem[],
  purchasedSlugs: string[],
  trialRendersUsed: number,
  isLoggedIn: boolean
): ResolvedStudioBorders {
  if (!isLoggedIn) {
    return {
      dropdownBorders: all,
      trialExhaustedNoPurchase: false,
      noPurchasedBordersEmpty: false,
    };
  }

  const purchasedSet = new Set(purchasedSlugs);
  const dropdownBorders = all.map((b) => ({
    ...b,
    isTrial: !purchasedSet.has(b.slug),
  }));

  const trialExhaustedNoPurchase = trialRendersUsed >= 2 && purchasedSlugs.length === 0;
  const noPurchasedBordersEmpty = all.length === 0;

  return {
    dropdownBorders,
    trialExhaustedNoPurchase,
    noPurchasedBordersEmpty,
  };
}
