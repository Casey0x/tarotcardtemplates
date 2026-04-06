import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioClient } from '@/components/studio-client';
import { fetchBorders } from '@/data/borders';
import { protectedBorderImageUrl } from '@/lib/border-asset-urls';
import { resolveStudioBorderOptions } from '@/lib/studio-border-options';
import { createServerClient } from '@/lib/supabase-server';
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
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/studio');
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

  return (
    <>
      <StudioSessionRedirect />
      <StudioClient
        user={user}
        borders={dropdownBorders}
        borderCatalog={borderOptions}
        initialBorderSlug={initialBorderSlug}
        exportUnlockedBorderSlugs={purchasedBorderSlugs}
        noBordersInCatalog={noBordersInCatalog}
      />
    </>
  );
}
