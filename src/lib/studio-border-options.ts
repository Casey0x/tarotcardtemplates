export type StudioPreviewItem = {
  slug: string;
  name: string;
  image: string;
  /** Transparent-center border PNG for live upload view; optional. */
  transparentImage?: string | null;
};

export type ResolvedStudioBorders = {
  dropdownBorders: StudioPreviewItem[];
  /** @deprecated always false; kept for callers that destructure */
  trialExhaustedNoPurchase: boolean;
  /** True when the catalog has no borders (misnamed historically). */
  noBordersInCatalog: boolean;
};

/** All borders are available in the dropdown; export is gated separately in the UI. */
export function resolveStudioBorderOptions(all: StudioPreviewItem[]): ResolvedStudioBorders {
  return {
    dropdownBorders: all,
    trialExhaustedNoPurchase: false,
    noBordersInCatalog: all.length === 0,
  };
}
