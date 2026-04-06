import type { Metadata } from 'next';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioSignInRequired } from '@/components/studio-sign-in-required';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import { protectedBorderImageUrl } from '@/lib/border-asset-urls';
import { resolveStudioBorderOptions } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-server';
import { fetchPurchasedBorderSlugsForUser } from '@/lib/user-purchases';
import { getUserCurrency } from '@/lib/getUserCurrency';
import { formatPrice } from '@/lib/formatPrice';
import { getDeckDownloadPriceByCurrency } from '@/lib/template-pricing';

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
  if (!user) {
    const q = searchParams?.border?.trim();
    const returnPath = q ? `/studio?border=${encodeURIComponent(q)}` : '/studio';
    return (
      <>
        <StudioSessionRedirect />
        <StudioSignInRequired returnPath={returnPath} />
      </>
    );
  }

  const borders = await fetchBorders();
  const purchasedBorderSlugs = await fetchPurchasedBorderSlugsForUser();

  const borderOptions = borders.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: protectedBorderImageUrl(b.slug),
    transparentImage: b.transparentImage?.trim()
      ? `${protectedBorderImageUrl(b.slug)}?variant=transparent`
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
        initialBorderSlug={initialBorderSlug}
        exportUnlockedBorderSlugs={purchasedBorderSlugs}
        noBordersInCatalog={noBordersInCatalog}
        deckDownloadPriceDisplay={deckDownloadPriceDisplay}
      />
    </>
  );
}
