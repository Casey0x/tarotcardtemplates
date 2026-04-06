import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import {
  protectedBorderImageUrl,
  publicBorderThumbPath,
  publicBorderThumbTransparentPath,
} from '@/lib/border-asset-urls';
import { resolveStudioBorderOptions } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-server';
import { fetchPurchasedBorderSlugsForUser } from '@/lib/user-purchases';
import { getUserCurrency } from '@/lib/getUserCurrency';
import { formatPrice } from '@/lib/formatPrice';
import { getDeckDownloadPriceByCurrency } from '@/lib/template-pricing';

export const dynamic = 'force-dynamic';

export default async function StudioBetaPage({
  searchParams,
}: {
  searchParams: { border?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const purchasedBorderSlugs = await fetchPurchasedBorderSlugsForUser();

  const borders = await fetchBorders();
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
  const { dropdownBorders, noBordersInCatalog } = resolveStudioBorderOptions(borderOptions);

  const initialBorderSlug =
    q && borderOptions.some((b) => b.slug === q)
      ? q
      : purchasedBorderSlugs[0] ?? borderOptions[0]?.slug;

  const { currency } = getUserCurrency();
  const deckDownloadPriceDisplay = formatPrice(getDeckDownloadPriceByCurrency(currency), currency);

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview
        borders={dropdownBorders}
        borderCatalog={borderOptions}
        studioBasePath="/studio-beta"
        initialBorderSlug={initialBorderSlug}
        exportUnlockedBorderSlugs={purchasedBorderSlugs}
        isLoggedIn={isLoggedIn}
        noBordersInCatalog={noBordersInCatalog}
        deckDownloadPriceDisplay={deckDownloadPriceDisplay}
      />
    </>
  );
}
