import Link from "next/link";
import type { TarotTemplate } from "@/lib/templates";

export function TemplateCard({ template }: { template: TarotTemplate }) {
  const thumbUrl = template.previewImages?.[0];

  return (
    <article className="border border-charcoal/10 bg-white p-6">
      <div className="mb-5 aspect-[4/3] w-full overflow-hidden bg-parchment">
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt={template.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <h3 className="text-xl font-semibold">{template.name}</h3>
      <p className="mt-2 text-sm text-charcoal/80">
        {template.description}
      </p>

      <p className="mt-3 text-sm">
        Template download: ${template.templatePrice.toFixed(2)}
      </p>

      <Link
        href={`/templates/${template.slug}`}
        className="mt-5 inline-block border border-charcoal px-4 py-2 text-sm hover:bg-charcoal hover:text-cream"
      >
        View template
      </Link>
    </article>
  );
}
