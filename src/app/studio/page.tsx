import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { fetchBorders } from '@/data/borders';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const borders = await fetchBorders();

  const borderOptions = borders.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: b.image ?? FALLBACK_BORDER_IMAGE,
    transparentImage: b.transparentImage ?? undefined,
  }));

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview borders={borderOptions} />
    </>
  );
}
