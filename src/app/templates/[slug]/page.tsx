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

      {/* Art Nouveau Symbolism Section - ASTRAL-DOMINION ONLY */}
      {template.slug === "Astral-Dominion" && (
        <section className="mt-20 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-4 top-20 text-amber-600 opacity-20 text-6xl select-none pointer-events-none hidden lg:block">
            ❦
          </div>
          <div className="absolute right-4 top-20 text-amber-600 opacity-20 text-6xl select-none pointer-events-none hidden lg:block">
            ❦
          </div>
          
          {/* Premium Notice Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 mb-12">
            <p className="text-amber-900 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">✦</span>
              <span>
                <strong>Artistic Design:</strong> Art Nouveau styling with elegant lettering and symmetrical 
                designs meet high-quality graphics with mystical resonance.
              </span>
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Content */}
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6 text-charcoal" style={{ fontFamily: 'Georgia, serif' }}>
                Art Nouveau Symbolism in The Astral-Dominion Tarot Deck
              </h2>
              
              <p className="text-lg text-charcoal/80 mb-6 leading-relaxed">
                The Astral-Dominion Tarot Deck combines ethereal celestial imagery with the timeless 
                elegance of Art Nouveau design, creating a harmonious blend of mysticism and artistry.
              </p>
              
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                Unlike traditional Rider-Waite interpretations, this deck presents The Fool suspended 
                within a celestial wheel—symbolizing destiny&apos;s gentle guidance rather than 
                impulsive leaps into the unknown.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-charcoal/80">Celestial motifs with stars, moons, and cosmic energy patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-charcoal/80">Ornate golden borders that frame each card like precious artwork</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1 flex-shrink-0">•</span>
                  <span className="text-charcoal/80">Flowing organic forms representing spiritual growth and transformation</span>
                </li>
              </ul>

              <Link 
                href="/card-meanings/the-fool"
                className="inline-block px-8 py-3 bg-amber-50 border-2 border-charcoal text-charcoal font-medium hover:bg-charcoal hover:text-amber-50 transition-all duration-300"
              >
                Explore the full interpretation of The Fool →
              </Link>
            </div>

            {/* Right Column - TheNextCard Integration */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 border border-charcoal/15">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-semibold">Read This Deck With AI</h3>
              </div>
              
              <p className="text-charcoal/80 mb-4">
                Power your Astral-Dominion deck with TheNextCard.
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span className="text-sm">Select your drawn cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span className="text-sm">Ask personal questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span className="text-sm">Save readings to your journal</span>
                </li>
              </ul>

              <div className="flex justify-center mb-6">
                <img 
                  src="https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/shared/thenextcard-mockup.png"
                  alt="TheNextCard app interface showing tarot reading"
                  className="w-56 h-auto"
                />
              </div>

              <Link 
                href="https://www.thenextcard.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-6 py-3 bg-charcoal text-amber-50 font-medium hover:bg-charcoal/90 transition-colors"
              >
                Ask TheNextCard
              </Link>
            </div>
          </div>

          {/* The Fool Interpretation Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <div className="inline-block w-16 h-px bg-charcoal/20 mb-4"></div>
            </div>
            
            <h3 className="text-3xl font-serif font-bold mb-6 text-center text-charcoal" style={{ fontFamily: 'Georgia, serif' }}>
              The Fool in the Astral-Dominion Deck
            </h3>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-charcoal/80 leading-relaxed mb-4">
                In this deck, The Fool is suspended within a celestial wheel—symbolizing 
                destiny, cosmic timing, and divine orchestration.
              </p>
              
              <p className="text-charcoal/80 leading-relaxed">
                Unlike the traditional Rider-Waite Fool standing at a cliff&apos;s edge, this interpretation 
                suggests movement guided by fate rather than reckless spontaneity. The Fool dances 
                with cosmic forces, trusting in the universe&apos;s grand design.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
