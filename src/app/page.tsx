import Link from 'next/link';
import TemplateCard from '@/components/template-card';
import { getAllTemplates } from '@/lib/templates';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const borderStyles = [
  {
    name: 'Celestial Gilded Border',
    slug: 'celestial-gilded',
    description: 'Rich gold celestial motifs with stars, moons, and ornate tarot symbolism.',
    image: '/images/template-styles/celestial-gilded.png',
  },
  {
    name: 'Minimal Line Border',
    slug: 'minimal-line',
    description: 'Clean minimalist tarot frame with subtle corner symbols and modern spacing.',
    image: '/images/template-styles/minimal-line-arcana.png',
  },
  {
    name: 'Vintage Velvet Border',
    slug: 'vintage-velvet',
    description: 'Baroque-inspired gilded frame with dramatic jewel tones and theatrical ornament.',
    image: '/images/template-styles/vintage-velvet.png',
  },
];

export default async function HomePage() {
  const featuredTemplates = (await getAllTemplates())
    .filter((template) => template.featured)
    .slice(0, 3);

  return (
    <div className="space-y-16">

      {/* HERO */}
      <section className="celestial-background space-y-6 px-8 py-12 rounded-sm -mx-8">
        <p className="text-sm uppercase tracking-[0.2em] text-charcoal/70">
          TarotCardTemplates.com
        </p>

        <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
          Tarot Card Templates + Deck Printing
        </h1>

        <p className="max-w-3xl text-lg text-charcoal/80">
          Download print-ready tarot templates instantly — or order a professionally printed deck from any template.
        </p>

        <p className="max-w-3xl text-sm text-charcoal/70">
          Templates from $18.95. Printed decks from $45.
        </p>

        <div className="flex gap-4">
          <Link
            href="/templates"
            className="border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream"
          >
            Browse templates
          </Link>

          <Link
            href="/how-it-works"
            className="border border-charcoal px-5 py-3 text-sm"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* BORDER STYLES */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Tarot Card Border Styles</h2>

          <p className="max-w-md text-sm text-charcoal/80">
            Explore a few of the border design directions available for your tarot deck —
            from minimalist line frames to richly gilded celestial borders.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {borderStyles.map((style) => (
            <Link
              key={style.name}
              href={`/borders/${style.slug}`}
              className="group flex flex-col rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
            >
              <div className="relative mb-4 overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3 aspect-[3/5]">
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              <h3 className="mb-1 text-sm font-semibold text-charcoal">
                {style.name}
              </h3>

              <p className="text-xs text-charcoal/80">
                {style.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED TEMPLATES */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Ready-Made Tarot Card Templates</h2>

          <Link
            href="/templates"
            className="text-sm underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredTemplates.length > 0 ? (
            featuredTemplates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))
          ) : (
            <p className="text-charcoal/80">
              Templates are being added. Check back shortly.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
