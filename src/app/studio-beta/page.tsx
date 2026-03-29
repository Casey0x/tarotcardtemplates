import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import { fetchPurchasedBorderSlugsForUser } from '@/lib/user-purchases';

export default async function StudioBetaPage({
  searchParams,
}: {
  searchParams: { border?: string };
}) {
  const purchasedBorderSlugs = await fetchPurchasedBorderSlugsForUser();

  const borderOptions = BORDER_TEMPLATES.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: b.image?.trim() ? b.image : FALLBACK_BORDER_IMAGE,
    transparentImage: b.transparentImage?.trim() ? b.transparentImage.trim() : undefined,
  }));

  const q = searchParams?.border?.trim();
  const initialBorderSlug =
    q && borderOptions.some((b) => b.slug === q) ? q : undefined;

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview
        borders={borderOptions}
        studioBasePath="/studio-beta"
        initialBorderSlug={initialBorderSlug}
        purchasedBorderSlugs={purchasedBorderSlugs}
      />
    </>
  );
}
