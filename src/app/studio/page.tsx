import type { Metadata } from 'next';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { DEFAULT_BORDER_PRICE_CENTS, fetchBorders } from '@/data/borders';
import { formatUsdAsLocalCurrency } from '@/lib/formatPrice';
import { getUserCurrency } from '@/lib/getUserCurrency';
import {
  protectedBorderImageUrl,
  publicBorderThumbPath,
  publicBorderThumbTransparentPath,
} from '@/lib/border-asset-urls';
import { resolveStudioBorderOptions } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-server';
import { fetchTrialRendersUsedForUser } from '@/lib/user-trial-renders';
import { fetchPurchasedBorderSlugsForUser } from '@/lib/user-purchases';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/studio' },
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: { border?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const borders = await fetchBorders();
  const [purchasedBorderSlugs, trialRendersUsed] = await Promise.all([
    fetchPurchasedBorderSlugsForUser(),
    fetchTrialRendersUsedForUser(),
  ]);

  const borderOptions = borders.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: isLoggedIn ? protectedBorderImageUrl(b.slug) : publicBorderThumbPath(b.slug),
    transparentImage: b.transparentImage?.trim()
      ? isLoggedIn
        ? `${protectedBorderImageUrl(b.slug)}?variant=transparent`
        : publicBorderThumbTransparentPath(b.slug)
      : undefined,
  }));

  const q = searchParams?.border?.trim();
  const { dropdownBorders, trialExhaustedNoPurchase, noPurchasedBordersEmpty } = resolveStudioBorderOptions(
    borderOptions,
    purchasedBorderSlugs,
    trialRendersUsed,
    isLoggedIn,
    q
  );

  const initialBorderSlug =
    q && dropdownBorders.some((b) => b.slug === q) ? q : dropdownBorders[0]?.slug;

  const { currency } = getUserCurrency();
  const borderListPriceDisplay = formatUsdAsLocalCurrency(DEFAULT_BORDER_PRICE_CENTS / 100, currency);

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview
        borders={dropdownBorders}
        borderCatalog={borderOptions}
        initialBorderSlug={initialBorderSlug}
        purchasedBorderSlugs={purchasedBorderSlugs}
        trialRendersUsed={trialRendersUsed}
        isLoggedIn={isLoggedIn}
        trialExhaustedNoPurchase={trialExhaustedNoPurchase}
        noPurchasedBordersEmpty={noPurchasedBordersEmpty}
        borderListPriceDisplay={borderListPriceDisplay}
      />
    </>
  );
}
