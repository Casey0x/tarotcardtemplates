import Link from "next/link";
import Image from "next/image";
import { getTemplateCardImageSrc, TarotTemplate } from "@/lib/templates";
import type { SupportedCurrency } from "@/lib/getUserCurrency";

interface TemplateCardProps {
  template: TarotTemplate;
  /** Fixed regional template download price, e.g. `$14.95` or `NZ$24.95` */
  templatePriceDisplay: string;
  /** ISO currency code for an optional label (hide or USD for cleaner USD rows). */
  currencyCode: SupportedCurrency;
}

export default function TemplateCard({
  template,
  templatePriceDisplay,
  currencyCode,
}: TemplateCardProps) {
  const imageSrc = getTemplateCardImageSrc(template);

  return (
    <article className="border border-charcoal/10 bg-white flex flex-col h-full">
      <Link href={`/templates/${template.slug}`}>
        <div className="relative aspect-[2/3] w-full max-h-96">
          <Image
            src={imageSrc}
            alt={template.name}
            fill
            className="object-contain p-3"
          />
        </div>
      </Link>

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
          Template download: {templatePriceDisplay}
          {currencyCode !== "USD" && (
            <span className="ml-1.5 text-xs font-normal text-charcoal/50">{currencyCode}</span>
          )}
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
