import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/templates";
import TemplateGallery from "@/components/template-gallery";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const template = await getTemplateBySlug(params.slug);

  if (!template) {
    return {
      title: "Template Not Found",
    };
  }

  const templateTitle = `${template.name} - Tarot Card Template | TarotCardTemplates.com`;
  const templateDescription = `${template.description} Download print-ready tarot deck templates. 78 card fronts included. Perfect for professional tarot readers and deck creators.`;
  const thumbnailUrl = template.previewImages?.[0] || "";

  return {
    title: templateTitle,
    description: templateDescription,
    keywords: [
      "tarot card template",
      "tarot deck template",
      "printable tarot cards",
      "custom tarot deck",
      template.name,
      "art nouveau tarot",
      "tarot design template",
      "professional tarot cards",
    ],
    openGraph: {
      title: templateTitle,
      description: templateDescription,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: `${template.name} tarot deck preview`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: templateTitle,
      description: templateDescription,
      images: [thumbnailUrl],
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await getTemplateBySlug(params.slug);

  if (!template) {
    notFound();
  }

  const physicalDeckImage = `https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/${template.slug.toUpperCase()}/physical-deck.png`;

  return (
    <article className="grid gap-10 lg:grid-cols-2">
      <section>
        <TemplateGallery
          images={template.previewImages ?? []}
          templateName={template.name}
        />

        <h1 className="mt-8 text-4xl font-semibold">
          {template.name}
        </h1>

        <p className="mt-3 text-charcoal/80">
          {template.description}
        </p>

        <p className="mt-4 text-sm">
          {template.styleNote}
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {template.includes.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <aside className="space-y-6">
        <div className="border border-charcoal/15 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Purchase options
          </h2>

          <div className="mt-6 space-y-4">
            <form
              action="/api/checkout"
              method="post"
              className="space-y-2 border border-charcoal/10 p-4"
            >
              <input
                type="hidden"
                name="templateSlug"
                value={template.slug}
              />
              <input
                type="hidden"
                name="purchaseType"
                value="template"
              />

              <p className="font-medium">
                Buy template (${template.templatePrice.toFixed(2)})
              </p>

              <button
                type="submit"
                className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream"
              >
                Continue to checkout
              </button>

              <p className="mt-2 text-sm text-neutral-500">
                Instant digital download. Print-ready files included.
              </p>
            </form>

            <div className="border border-charcoal/10 p-4 overflow-hidden">
              <p className="mb-3 text-sm font-medium text-charcoal/70">
                The Printed Deck
              </p>
              <div className="overflow-hidden mb-3">
                <img
                  src={physicalDeckImage}
                  alt={`${template.name} printed tarot deck with premium card stock`}
                  className="w-full h-auto transition-transform duration-300 hover:scale-110 cursor-pointer"
                />
              </div>
              <p className="text-xs text-charcoal/60">
                Professionally printed with premium card stock and luxe finishes
              </p>
            </div>

            <form
              action="/api/checkout"
              method="post"
              className="space-y-2 border border-charcoal/10 p-4"
            >
              <input
                type="hidden"
                name="templateSlug"
                value={template.slug}
              />
              <input
                type="hidden"
                name="purchaseType"
                value="print"
              />

              <p className="font-medium">
                Buy printed deck from template (${template.printPrice.toFixed(2)})
              </p>

              <button
                type="submit"
                className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream"
              >
                Continue to checkout
              </button>

              <p className="mt-2 text-sm text-neutral-500">
                Professionally printed and shipped.
              </p>
            </form>
          </div>

          <Link
            href="/how-it-works"
            className="mt-6 inline-block text-sm underline underline-offset-4"
          >
            Review how purchasing works
          </Link>
        </div>

        <div className="border border-charcoal/15 bg-white p-6">
          <h3 className="text-lg font-semibold">
            About Custom Tarot Cards (70 x 120mm)
          </h3>

          <div className="mt-4 space-y-3 text-sm text-charcoal/80">
            <p>
              Custom Tarot Cards (70 x 120mm) printed 300gsm with 350gsm printed (TUCK) box.
            </p>
            <p>
              Each custom tarot cards Deck is up to 78 cards.
            </p>
            
            <div className="mt-4 pt-4 border-t border-charcoal/10">
              <p className="font-medium text-charcoal mb-2">Size</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Cards: 70 x 120mm (L×H)</li>
                <li>Box: 74 x 124 x 28mm (L×H×D)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-charcoal/15 bg-cream p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>✨</span>
            <span>Use This Deck With TheNextCard.app</span>
          </h3>

          <p className="mt-3 text-sm text-charcoal/80">
            Power your printed deck with AI-assisted readings.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
            <li>• Ask questions and select your drawn cards</li>
            <li>• Get deeper interpretations instantly</li>
            <li>• Reflect and save readings in your journal</li>
          </ul>

          <div className="mt-6 flex justify-center">
            <img 
              src="https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/shared/thenextcard-mockup.png"
              alt="TheNextCard.app interface" 
              className="w-48 h-auto"
            />
          </div>

          <Link
            href="https://www.thenextcard.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block w-full text-center border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
          >
            Explore the AI Companion →
          </Link>
        </div>
      </aside>
    </article>
  );
}
