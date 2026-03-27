import { StudioSessionRedirect } from '@/components/studio-session-redirect';
import { StudioVisualPreview } from '@/components/studio-visual-preview';
import { BORDER_TEMPLATES } from '@/data/borders';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';

export default function StudioBetaPage() {
  const borderOptions = BORDER_TEMPLATES.map((b) => ({
    slug: b.slug,
    name: b.name,
    image: b.image?.trim() ? b.image : FALLBACK_BORDER_IMAGE,
  }));

  return (
    <>
      <StudioSessionRedirect />
      <StudioVisualPreview borders={borderOptions} studioBasePath="/studio-beta" />
    </>
  );
}
