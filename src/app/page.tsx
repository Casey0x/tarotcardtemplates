import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchBorders, FALLBACK_BORDER_IMAGE } from '@/data/borders';
import Image from 'next/image';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { getAllTemplates } from '@/lib/templates';
import { getUserCurrency } from '@/lib/getUserCurrency';
import { formatUsdAsLocalCurrency } from '@/lib/formatPrice';
import TemplateCard from '@/components/template-card';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/' },
    description:
      'Browse professionally designed tarot card templates for artists, readers, and indie publishers. Customizable borders, print-ready files, and single-deck printing available.',
  };
}

export default async function Page() {
  const borders = await fetchBorders();
  const templates = await getAllTemplates();
  const { currency } = getUserCurrency();

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Tarot Card Templates',
        url: SITE_URL,
        logo: absoluteUrl('/images/branding/tarot-card-templates-logo.png'),
        description:
          'Professionally designed tarot card templates, border frames, and optional single-deck printing for artists, readers, and indie publishers.',
      },
      {
        '@type': 'WebSite',
        name: 'Tarot Card Templates',
        url: SITE_URL,
      },
    ],
  };

  const celestialPatternUrl = '/backgrounds/celestial-pattern.png';

  return (
    <div className="relative isolate rounded-sm bg-[#f6f0e8]">
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-sm"
        style={{
          opacity: 0.09,
          backgroundImage: `url('${celestialPatternUrl}')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '480px',
        }}
        aria-hidden
      />
      <div className="relative z-10">
        <JsonLd data={homeJsonLd} />

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:items-stretch">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold leading-tight text-[#0B274A] md:text-6xl">
            You’ve had the idea for a tarot deck. Now bring it to life.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-gray-700 md:text-xl">
            Design, customise, and print your own tarot deck — without starting from scratch.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/studio"
              className="rounded-lg bg-[#FF5A1F] px-7 py-3.5 font-semibold text-white shadow-md transition hover:scale-[1.02] hover:opacity-90"
            >
              Start Creating Your Deck
            </a>

            <a
              href="/templates"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-gray-700 transition hover:bg-gray-50"
            >
              Explore Templates
            </a>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative min-h-[260px] w-full md:min-h-0 md:h-full">
          <img
            src="/images/hero.jpg"
            alt="Hand placing tarot card with ornate gothic border"
            className="h-full max-h-[520px] w-full rounded-xl object-cover shadow-xl"
          />
          <div className="absolute inset-0 rounded-xl bg-black/10" />
        </div>
      </section>

      {/* WHY THIS EXISTS */}
      <section className="mx-auto max-w-4xl px-6 py-10 text-center">
        <p className="text-xl leading-relaxed text-gray-700">Most people never create their tarot deck.</p>

        <p className="mt-3 text-gray-600">Not because they lack ideas… but because it feels overwhelming.</p>

        <p className="mt-3 text-gray-600">
          Where do you start? How do you design 78 cards? How do you make it look good?
        </p>

        <p className="mt-6 font-medium text-gray-800">This removes that friction.</p>

        <p className="mt-2 text-gray-600">
          You don’t start from zero — you start from something beautiful… and make it your own.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 text-center md:grid-cols-3">
        <div>
          <div className="text-3xl">🎨</div>
          <h3 className="mt-4 text-lg font-semibold text-[#0B274A]">Choose a Style</h3>
          <p className="mt-2 text-gray-600">Start with a professionally designed tarot template.</p>
        </div>

        <div>
          <div className="text-3xl">✏️</div>
          <h3 className="mt-4 text-lg font-semibold text-[#0B274A]">Customise Your Deck</h3>
          <p className="mt-2 text-gray-600">Add your own names, artwork, and meaning.</p>
        </div>

        <div>
          <div className="text-3xl">📦</div>
          <h3 className="mt-4 text-lg font-semibold text-[#0B274A]">Bring It to Life</h3>
          <p className="mt-2 text-gray-600">Print your deck, share it, or sell it.</p>
        </div>
      </section>

      {/* FEATURED DECKS — Honey Hive + Dark Botanical */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[#0B274A] md:text-4xl">This Is What Your Deck Could Become</h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Not templates — real decks you can bring to life.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-16 grid items-start gap-12 md:grid-cols-2">
          {/* LEFT: HONEY (PRIMARY) */}
          <div className="flex w-full flex-col items-center text-center">
            <div className="w-full max-w-xl">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl shadow-md">
                <img
                  src="/images/honey-hive.jpg"
                  alt="Honey Hive Tarot deck"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <h3 className="mt-6 text-xl font-semibold text-[#0B274A]">Honey Hive Tarot</h3>

            <p className="mt-2 max-w-sm text-gray-600">
              Warm, golden, and handcrafted — a deck that feels like something you already own.
            </p>

            <a
              href="/studio"
              className="mt-4 inline-block rounded-lg bg-[#FF5A1F] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              Create a deck like this
            </a>
          </div>

          {/* RIGHT: DARK BOTANICAL (SECONDARY) */}
          <div className="flex w-full flex-col items-center text-center opacity-90">
            <div className="w-full max-w-xl">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl shadow-md">
                <img
                  src="/images/dark-botanical.jpg"
                  alt="Dark Botanical Tarot deck"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <h3 className="mt-6 text-xl font-semibold text-[#0B274A]">Dark Botanical Tarot</h3>

            <p className="mt-2 max-w-sm text-gray-600">
              Deep, moody, and expressive — for something more introspective.
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-lg text-gray-700">Join creators already bringing their decks to life.</p>

        <p className="mt-4 text-sm text-gray-500">
          Thousands of unique tarot decks have been created using these templates.
        </p>
      </section>

      {/* Pre-made deck templates (Supabase) */}
      <section id="premade" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <h2 className="text-2xl font-semibold text-charcoal">Pre-Made Tarot Decks — Ready to Download</h2>
        <p className="mt-2 max-w-3xl text-sm text-charcoal/75">
          Complete 78-card tarot decks with original artwork. Instant digital download.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 && (
            <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
              No deck templates are available right now. Check your Supabase REST configuration or try again later.
            </p>
          )}
          {templates.slice(0, 6).map((template) => (
            <TemplateCard
              key={template.slug}
              template={template}
              templatePriceDisplay={formatUsdAsLocalCurrency(template.templatePrice, currency)}
              currencyCode={currency}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/templates"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            View All Templates
          </a>
        </div>
      </section>

      {/* BORDER TEMPLATES */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-center text-2xl font-semibold text-[#0B274A] md:text-3xl">Design Your Own Card Frames</h2>

        <p className="mt-3 text-center text-gray-600">
          Start with a border and build your deck from the ground up.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {borders.slice(0, 3).map((border) => (
            <Link key={border.slug} href={`/borders/${border.slug}`} className="block">
              <Image src={border.image ?? FALLBACK_BORDER_IMAGE} alt={border.name} width={200} height={300} />
              <h3 className="mt-2 font-semibold text-charcoal">{border.name}</h3>
              <p className="mt-2 text-sm text-gray-600">
                Elegant, detailed frame designed for custom tarot creation.
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/borders"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            View All Borders
          </a>
        </div>
      </section>
      </div>
    </div>
  );
}
