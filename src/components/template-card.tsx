import Link from "next/link";
import { TarotTemplate } from "@/lib/templates";

interface TemplateCardProps {
  template: TarotTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/template-previews/${template.slug.toUpperCase()}/thumb.png`;

  return (
    <article className="border border-charcoal/10 bg-white flex flex-col h-full">
      {thumbnailUrl && (
        <Link href={`/templates/${template.slug}`}>
          <img
            src={thumbnailUrl}
            alt={template.name}
            className="aspect-[2/3] w-full max-h-96 object-cover"
          />
        </Link>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold">
          <Link href={`/templates/${template.slug}`}>
            {template.name}
          </Link>
        </h2>

        <p className="mt-3 text-sm text-charcoal/80 flex-grow">
          {template.description}
        </p>

        <p className="mt-4 text-sm font-medium">
          Template download: ${template.templatePrice.toFixed(2)}
        </p>

        <Link
          href={`/templates/${template.slug}`}
          className="mt-4 inline-block border border-charcoal bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-cream transition-colors text-center"
        >
          View template
        </Link>
      </div>
    </article>
  );
}
