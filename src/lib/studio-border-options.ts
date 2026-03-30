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
  isLoggedIn: boolean,
  trialBorderSlug?: string | null
): ResolvedStudioBorders {
  if (!isLoggedIn) {
    return {
      dropdownBorders: all,
      trialExhaustedNoPurchase: false,
      noPurchasedBordersEmpty: false,
    };
  }

  const purchasedSet = new Set(purchasedSlugs);
  const owned = all.filter((b) => purchasedSet.has(b.slug));

  const q = trialBorderSlug?.trim();
  const canTrialUnowned = trialRendersUsed < 2;
  let list: StudioPreviewItem[] = [...owned];

  if (q && !purchasedSet.has(q) && canTrialUnowned) {
    const t = all.find((b) => b.slug === q);
    if (t) {
      const withoutQ = list.filter((b) => b.slug !== q);
      list = [...withoutQ, { ...t, isTrial: true }];
    }
  }

  const trialExhaustedNoPurchase = trialRendersUsed >= 2 && purchasedSlugs.length === 0;
  const noPurchasedBordersEmpty =
    purchasedSlugs.length === 0 && list.length === 0 && !trialExhaustedNoPurchase;

  return {
    dropdownBorders: list,
    trialExhaustedNoPurchase,
    noPurchasedBordersEmpty,
  };
}
