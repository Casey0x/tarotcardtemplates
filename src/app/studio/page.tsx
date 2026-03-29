import type { Metadata } from 'next';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
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
    image: b.image ?? FALLBACK_BORDER_IMAGE,
    transparentImage: b.transparentImage ?? undefined,
  }));

  const { dropdownBorders, trialExhaustedNoPurchase } = resolveStudioBorderOptions(
    borderOptions,
    purchasedBorderSlugs,
    trialRendersUsed,
    isLoggedIn
  );

  const q = searchParams?.border?.trim();
  const initialBorderSlug =
    q && dropdownBorders.some((b) => b.slug === q)
      ? q
      : dropdownBorders[0]?.slug;

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
      />
    </>
  );
}
