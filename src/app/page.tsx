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
    <div className="space-y-16 rounded-sm bg-[#f6f0e8] bg-[radial-gradient(circle_at_top,_rgba(214,186,140,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(155,126,189,0.16),_transparent_55%)]">

      {/* HERO */}
      <section className="relative -mx-8 overflow-hidden rounded-sm bg-gradient-to-b from-cream/95 via-cream/98 to-[#f6f0e8] px-8 py-12">
        <style>{`
          @keyframes heroFloatUp {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}
        </style>

        <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] text-charcoal/70">
              TarotCardTemplates.com
            </p>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
              Create Your Own Tarot Deck
            </h1>

            <p className="max-w-3xl text-lg text-charcoal/80">
              Professional tarot card templates designed for artists, tarot readers, and indie publishers. Compatible with Canva, Photoshop, and print-ready tarot sizes.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/templates"
                className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream shadow-[0_14px_35px_rgba(15,23,42,0.32)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.35)]"
              >
                Browse Templates
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal shadow-sm transition-colors duration-150 hover:border-amber-500 hover:bg-cream"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="pointer-events-none relative hidden h-72 md:block lg:h-80">
            <div className="absolute inset-x-6 top-10 h-56 rounded-full bg-gradient-to-b from-amber-200/40 via-transparent to-transparent blur-2xl" />

            <div
              className="absolute left-2 top-4 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95 shadow-[0_18px_45px_rgba(15,23,42,0.3)]"
              style={{ animation: 'heroFloatUp 11s ease-in-out infinite', animationDelay: '0s' }}
            >
              <Image
                src={borderStyles[0].image}
                alt="tarot card template preview"
                width={220}
                height={330}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div
              className="absolute left-24 top-10 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95 shadow-[0_18px_45px_rgba(15,23,42,0.28)]"
              style={{ animation: 'heroFloatUp 12s ease-in-out infinite', animationDelay: '0.8s' }}
            >
              <Image
                src={borderStyles[1].image}
                alt="tarot card template preview"
                width={220}
                height={330}
                className="h-full w-full object-cover"
              />
            </div>

            <div
              className="absolute left-14 top-20 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95 shadow-[0_18px_45px_rgba(15,23,42,0.26)]"
              style={{ animation: 'heroFloatUp 13s ease-in-out infinite', animationDelay: '1.6s' }}
            >
              <Image
                src={borderStyles[2].image}
                alt="tarot card template preview"
                width={220}
                height={330}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MARBLE TEMPLE TAROT BORDER — featured on main page */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Marble Temple Tarot Border</h2>
          <p className="mt-2 max-w-2xl text-sm text-charcoal/80">
            Classical marble tarot card border with fluted columns and an arched central window for your artwork.
          </p>
        </div>

        <Link
          href="/borders/marble-temple"
          className="group flex flex-col overflow-hidden rounded-sm border border-charcoal/10 bg-cream/80 transition-all duration-200 hover:border-amber-400 hover:shadow-xl md:flex-row md:items-center"
        >
          <div className="relative h-64 w-full shrink-0 overflow-hidden border-b border-charcoal/10 bg-cream p-6 md:h-72 md:max-w-sm md:border-b-0 md:border-r">
            <Image
              src="/images/templates/marble-temple-tarot-border.png"
              alt="Marble Temple Tarot Border"
              fill
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6">
            <h3 className="mb-2 text-lg font-semibold text-charcoal">Marble Temple Tarot Border</h3>
            <p className="mb-4 text-sm text-charcoal/80">
              A classical marble tarot card border featuring fluted columns, Corinthian capitals, and an arched central window. The center is transparent and designed for inserting tarot illustrations.
            </p>
            <span className="text-sm font-medium text-charcoal underline underline-offset-4 group-hover:text-mutedGold">
              View border & purchase →
            </span>
          </div>
        </Link>
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
