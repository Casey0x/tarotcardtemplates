import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllTemplates } from "@/lib/templates";
import TemplateCard from "@/components/template-card";
import { fetchBorders, FALLBACK_BORDER_IMAGE, formatBorderPriceLocalized } from "@/data/borders";
import { getUserCurrency } from "@/lib/getUserCurrency";
import { formatBorderListPriceDisplay, formatTemplatePriceDisplay } from "@/lib/template-pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarot Card Templates",
  description: "Browse our collection of professionally designed tarot card templates.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesPage() {
  const { currency } = getUserCurrency();
  const templates = await getAllTemplates();
  const borders = await fetchBorders();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
      <p className="mt-3 text-charcoal/70">
        Border frames for your own art, plus ready-made full decks — all in one place.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-charcoal">
          Border Templates — Design Your Own Deck
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-charcoal/75">
          Choose a border frame, then use the Studio to add your own artwork to all 78 cards.{' '}
          {formatBorderListPriceDisplay(currency)} each.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {borders.length === 0 && (
            <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
              No border templates are available right now. Check your database connection or try again later.
            </p>
          )}
          {borders.map((border) => (
            <div
              key={border.slug}
              className="flex h-full flex-col border border-charcoal/10 bg-white transition-colors hover:border-charcoal/20"
            >
              <Link href={`/borders/${border.slug}`} className="block shrink-0">
                <div className="relative aspect-[2/3] w-full max-h-96">
                  <Image
                    src={border.image ?? FALLBACK_BORDER_IMAGE}
                    alt={border.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>
              </Link>
              <div className="flex flex-grow flex-col p-6">
                <h3 className="text-xl font-semibold">{border.name}</h3>
                <p className="mt-3 flex-grow text-sm text-charcoal/80">{border.description}</p>
                <p className="mt-4 text-sm font-medium">
                  {formatBorderPriceLocalized(border, currency)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/borders/${border.slug}`}
                    className="inline-block border border-charcoal bg-charcoal px-4 py-2 text-center text-sm text-cream transition-colors hover:bg-charcoal/90"
                  >
                    View template
                  </Link>
                  <Link
                    href={`/studio-beta?border=${border.slug}`}
                    className="inline-block border border-charcoal/30 bg-cream px-4 py-2 text-center text-sm text-charcoal transition-colors hover:border-charcoal/50 hover:bg-charcoal/5"
                  >
                    Try in Studio →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="my-16 border-t border-charcoal/15" aria-hidden />

      <section id="premade" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold text-charcoal">
          Pre-Made Tarot Decks — Ready to Download
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-charcoal/75">
          Complete 78-card tarot decks with original artwork. Instant digital download.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 && (
            <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
              No deck templates are available right now. Check your Supabase REST configuration or try again later.
            </p>
          )}
          {templates.map((template) => (
            <TemplateCard
              key={template.slug}
              template={template}
              templatePriceDisplay={formatTemplatePriceDisplay(currency)}
              currencyCode={currency}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
