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
    <>
      <article className="grid gap-10 lg:grid-cols-2">
        <section>
          <TemplateGallery
            images={template.previewImages ?? []}
            templateName={template.name}
          />

          <h1 className="mt-8 text-4xl font-semibold">
            {template.name}
          </h1>

          {/* Dynamic SEO Content — rendered only when populated in DB */}
          {template.seoHeading ? (
            <>
              <h2 className="mt-6 text-xl font-semibold">
                {template.seoHeading}
              </h2>

              <p className="mt-3 text-charcoal/80">
                {template.seoDescription}
              </p>

              {template.seoPerfectFor && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Perfect for:</h3>
                  <ul className="space-y-1 text-sm text-charcoal/80">
                    {template.seoPerfectFor.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {template.seoSymbolismHeading && (
                <div className="mt-10 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      {template.seoSymbolismHeading}
                    </h3>
                    <p className="text-charcoal/80">{template.seoSymbolismBody}</p>
                  </div>

                  {template.seoCardSpotlightHeading && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {template.seoCardSpotlightHeading}
                      </h3>
                      <p className="text-charcoal/80 mb-3">
                        {template.seoCardSpotlightBody}
                      </p>
                      {template.seoCardSpotlightLink && (
                        <Link
                          href={template.seoCardSpotlightLink}
                          className="inline-block text-sm text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
                        >
                          Explore the full interpretation →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                  className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/90 transition-colors"
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

              {/* About the Printed Deck */}
              <div className="border border-charcoal/10 p-4 bg-white">
                <h3 className="text-sm font-semibold mb-3">
                  About the Printed Deck
                </h3>

                <ul className="space-y-1 text-xs text-charcoal/80">
                  <li>• Premium 300gsm card stock</li>
                  <li>• 350gsm printed tuck box included</li>
                  <li>• Complete 78-card deck</li>
                  <li>• Standard size: 70 x 120mm</li>
                  <li>• Professional print quality</li>
                </ul>
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
                  className="w-full border-2 border-charcoal bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
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

      {/* Tarot Card Meanings Section */}
      <section className="mt-16 mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-[#C7A96B] text-sm">✦——✦</span>
          <h2 className="text-xl font-semibold tracking-wide text-charcoal">
            Explore Tarot Card Meanings
          </h2>
          <span className="text-[#C7A96B] text-sm">✦——✦</span>
        </div>
        <p className="text-sm text-charcoal/70 mb-8 max-w-lg mx-auto">
          Tarot cards carry symbolic meaning used in divination and storytelling. Explore the interpretations behind some classic tarot cards.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: "The Star", slug: "the-star", alt: "The Star tarot card meaning" },
            { name: "The Moon", slug: "the-moon", alt: "The Moon tarot card meaning" },
            { name: "The Magician", slug: "the-magician", alt: "The Magician tarot card meaning" },
            { name: "The Fool", slug: "the-fool", alt: "The Fool tarot card meaning" },
          ].map((card) => (
            <Link
              key={card.slug}
              href={`/meanings/${card.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative" style={{ width: "105px" }}>
                <img
                  src={`/images/tarot-thumbs/${card.slug}.jpg`}
                  alt={card.alt}
                  width={105}
                  height={175}
                  className="rounded-md object-cover transition-transform duration-200 group-hover:-translate-y-1"
                  style={{ width: "105px", height: "175px" }}
                />
                <div
                  className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ border: "2px solid #C7A96B", borderRadius: "7px" }}
                />
              </div>
              <span className="text-xs text-charcoal/70 text-center leading-tight">
                {card.name} Tarot Meaning
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/tarot-card-meanings"
            className="text-sm text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
          >
            View All Tarot Card Meanings →
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data for Tarot Card Meanings */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Tarot Card Meanings",
            "description": "Explore the symbolic meanings behind classic tarot cards used in divination and storytelling.",
            "url": "https://www.tarotcardtemplates.com/tarot-card-meanings",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "The Star Tarot Meaning",
                "url": "https://www.tarotcardtemplates.com/meanings/the-star"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "The Moon Tarot Meaning",
                "url": "https://www.tarotcardtemplates.com/meanings/the-moon"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "The Magician Tarot Meaning",
                "url": "https://www.tarotcardtemplates.com/meanings/the-magician"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "The Fool Tarot Meaning",
                "url": "https://www.tarotcardtemplates.com/meanings/the-fool"
              }
            ]
          })
        }}
      />

      {/* Sticky Mobile Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-charcoal/20 p-3 lg:hidden z-50 shadow-lg">
        <div className="max-w-md mx-auto flex gap-2">
          <form action="/api/checkout" method="post" className="flex-1">
            <input type="hidden" name="templateSlug" value={template.slug} />
            <input type="hidden" name="purchaseType" value="template" />
            <button
              type="submit"
              className="w-full bg-charcoal text-cream py-3 px-3 text-xs font-semibold hover:bg-charcoal/90 transition-colors"
            >
              Template ${template.templatePrice.toFixed(2)}
            </button>
          </form>
          <form action="/api/checkout" method="post" className="flex-1">
            <input type="hidden" name="templateSlug" value={template.slug} />
            <input type="hidden" name="purchaseType" value="print" />
            <button
              type="submit"
              className="w-full border-2 border-charcoal bg-white text-charcoal py-3 px-3 text-xs font-semibold hover:bg-charcoal hover:text-cream transition-colors"
            >
              Printed ${template.printPrice.toFixed(2)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
