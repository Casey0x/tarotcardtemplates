import { unstable_cache } from 'next/cache';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioSignInRequired } from '@/components/studio-sign-in-required';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import { protectedBorderImageUrl } from '@/lib/border-asset-urls';
import { normalizeBorderQuerySlug } from '@/lib/border-image-slug';
import { resolveStudioBorderOptions } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-server';
import { fetchPurchasedBorderSlugsForUserId } from '@/lib/user-purchases';

export const dynamic = 'force-dynamic';

const getCachedBordersCatalog = unstable_cache(() => fetchBorders(), ['borders-catalog'], { revalidate: 120 });

export default async function StudioBetaPage({
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
    const returnPath = q ? `/studio-beta?border=${encodeURIComponent(q)}` : '/studio-beta';
    return (
      <>
        <StudioSessionRedirect />
        <StudioSignInRequired returnPath={returnPath} />
      </>
    );
  }

  const [borders, purchasedBorderSlugs] = await Promise.all([
    getCachedBordersCatalog(),
    unstable_cache(
      () => fetchPurchasedBorderSlugsForUserId(user.id),
      ['purchased-border-slugs', user.id],
      { revalidate: 45 },
    )(),
  ]);
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

  const initialBorderSlug = (() => {
    if (!q) return purchasedBorderSlugs[0] ?? borderOptions[0]?.slug;
    if (borderOptions.some((b) => b.slug === q)) return q;
    const normalized = normalizeBorderQuerySlug(q);
    if (borderOptions.some((b) => b.slug === normalized)) return normalized;
    return purchasedBorderSlugs[0] ?? borderOptions[0]?.slug;
  })();

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview
        borders={dropdownBorders}
        borderCatalog={borderOptions}
        studioBasePath="/studio-beta"
        initialBorderSlug={initialBorderSlug}
        exportUnlockedBorderSlugs={purchasedBorderSlugs}
        noBordersInCatalog={noBordersInCatalog}
      />
    </>
  );
}
