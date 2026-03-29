import type { Metadata } from 'next';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
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
  const borders = await fetchBorders();
  const purchasedBorderSlugs = await fetchPurchasedBorderSlugsForUser();

  const borderOptions = borders.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: b.image ?? FALLBACK_BORDER_IMAGE,
    transparentImage: b.transparentImage ?? undefined,
  }));

  const q = searchParams?.border?.trim();
  const initialBorderSlug =
    q && borderOptions.some((b) => b.slug === q) ? q : undefined;

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview
        borders={borderOptions}
        initialBorderSlug={initialBorderSlug}
        purchasedBorderSlugs={purchasedBorderSlugs}
      />
    </>
  );
}
