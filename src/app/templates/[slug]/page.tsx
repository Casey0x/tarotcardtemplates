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
      "tarot design template",
      "professional tarot cards",
      "print ready tarot template",
      "commercial use tarot deck",
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

        {/* SEO Content Section - Astral-Dominion Only */}
        {template.slug === "Astral-Dominion" ? (
          <>
            <h2 className="mt-6 text-xl font-semibold">
              Art Nouveau Tarot Deck Design with Celestial Gold Detailing
            </h2>
            
            <p className="mt-3 text-charcoal/80">
              The Astral-Dominion tarot deck template is inspired by classic Art Nouveau design — flowing organic forms, ornate borders, and elegant gold embellishments. This printable tarot deck template blends celestial motifs with refined illustration to create a luxurious reading aesthetic. Unlike minimalist tarot layouts, this design embraces intricate detailing, layered symbolism, and symmetrical composition.
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              {template.includes.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            {/* Perfect For */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Perfect for:</h3>
              <ul className="space-y-1 text-sm text-charcoal/80">
                <li>• Tarot deck creators</li>
                <li>• Spiritual coaches & readers</li>
                <li>• Luxury tarot brands</li>
                <li>• Independent publishers</li>
                <li>• Artists launching their own tarot deck</li>
              </ul>
            </div>

            {/* Additional SEO Sections */}
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Celestial & Cosmic Tarot Symbolism
                </h3>
                <p className="text-charcoal/80">
                  At the heart of this deck is a strong celestial theme — circular cosmic framing, planetary references, and symbolic motion within a divine wheel. This cosmic tarot design evokes themes of destiny, movement, and spiritual alignment. The Astral-Dominion layout is ideal for those creating astrology-inspired tarot decks or celestial-themed spiritual products.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  The Fool in the Astral-Dominion Tarot Deck
                </h3>
                <p className="text-charcoal/80 mb-3">
                  In this deck, The Fool is depicted suspended within a celestial wheel — symbolising movement within destiny rather than naive risk. The circular composition and gold ornamentation transform the traditional Rider-Waite narrative into a cosmic journey motif.
                </p>
                <Link 
                  href="/card-meanings/the-fool"
                  className="inline-block text-sm text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
                >
                  Explore the full interpretation of The Fool →
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
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

            {/* Template Specs Box - Astral-Dominion Only */}
            {template.slug === "Astral-Dominion" && (
              <div className="border border-charcoal/10 p-4 bg-cream/30">
                <h3 className="text-sm font-semibold mb-2">
                  Luxury Printable Tarot Deck Template (300 DPI, Print-Ready)
                </h3>
                <p className="text-xs text-charcoal/80">
                  This tarot card template includes 78 high-resolution card fronts prepared for professional printing. Each file is delivered at 300 DPI with bleed settings suitable for standard tarot card dimensions (70 x 120mm). Perfect for independent publishers, Etsy sellers, spiritual entrepreneurs, or custom tarot deck creators seeking production-ready artwork.
                </p>
              </div>
            )}

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
