import Image from 'next/image';
import { getAllTemplates, getTemplatePreviewImages, TEMPLATE_PREVIEW_FALLBACK } from '@/lib/templates';
import { fetchBorders, FALLBACK_BORDER_IMAGE } from '@/data/borders';

export const dynamic = 'force-dynamic';

export default async function StudioTestPage() {
  const templates = await getAllTemplates();
  const borders = await fetchBorders();
  const template = templates[0] ?? null;
  const border = borders[0] ?? null;
  const previewUrls = template ? getTemplatePreviewImages(template) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <h1 className="text-2xl font-semibold">Studio test</h1>
      {!template && (
        <p className="text-sm text-charcoal/80">No template available to preview (REST or database may be unavailable).</p>
      )}
      {!border && <p className="text-sm text-charcoal/80">No border available to preview.</p>}
      {template && (
        <div>
          <p className="text-sm font-medium text-charcoal">{template.name}</p>
          <div className="relative mt-2 aspect-[2/3] w-48 border border-charcoal/10">
            <Image
              src={previewUrls[0] ?? TEMPLATE_PREVIEW_FALLBACK}
              alt={template.name}
              fill
              className="object-contain p-2"
              sizes="192px"
            />
          </div>
        </div>
      )}
      {border && (
        <div>
          <p className="text-sm font-medium text-charcoal">{border.name}</p>
          <div className="relative mt-2 aspect-[2/3] w-48 border border-charcoal/10">
            <Image
              src={border.image ?? FALLBACK_BORDER_IMAGE}
              alt={border.name}
              fill
              className="object-contain p-2"
              sizes="192px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
