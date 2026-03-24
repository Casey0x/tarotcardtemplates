import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBordersRecord, BORDER_TEMPLATES } from '@/data/borders';

const borders = getBordersRecord();

/** Other border templates for "You May Also Like" (exclude current slug) */
function getRelatedBorders(currentSlug: string) {
  return BORDER_TEMPLATES.filter((b) => b.slug !== currentSlug).slice(0, 3);
}

const VINTAGE_VELVET_EXAMPLES = [
  {
    src: '/images/examples/vintage-velvet-border-tarot-example-1.png',
    alt: 'Vintage Velvet tarot border example — rich velvet frame on a completed tarot card',
  },
  {
    src: '/images/examples/vintage-velvet-border-tarot-example-2.png',
    alt: 'Vintage Velvet tarot border example — ornate gold baroque flourishes on tarot card artwork',
  },
  {
    src: '/images/examples/vintage-velvet-border-tarot-example-3.png',
    alt: 'Vintage Velvet tarot border example — gothic tarot card design using the Vintage Velvet border template',
  },
];

const MARBLE_TEMPLE_EXAMPLES = [
  { src: '/images/examples/marble-temple-example-1.png', alt: 'Marble Temple tarot border example – The Fool', label: 'The Fool' },
  { src: '/images/examples/marble-temple-example-2.png', alt: 'Marble Temple tarot border example – The High Priestess', label: 'The High Priestess' },
  { src: '/images/examples/marble-temple-example-3.png', alt: 'Marble Temple tarot border example – Three of Swords', label: 'Three of Swords' },
];

const MYSTIC_CANDLELIGHT_EXAMPLES = [
  {
    src: '/images/examples/mystic-candlelight-example-1.png',
    alt: 'Mystic Candlelight tarot border example — The Lovers with melting wax frame and corner candles',
    label: 'The Lovers',
  },
  {
    src: '/images/examples/mystic-candlelight-example-2.png',
    alt: 'Mystic Candlelight tarot border example — Death with wax drips and candlelight glow',
    label: 'Death',
  },
  {
    src: '/images/examples/mystic-candlelight-example-3.png',
    alt: 'Mystic Candlelight tarot border example — The Hanged Man with warm wax border and lit candles',
    label: 'The Hanged Man',
  },
];

const TUTORIAL_LINKS = [
  { label: 'How to Create Tarot Cards in Canva', href: '/blog/create-tarot-cards-canva' },
  { label: 'How to Design a Tarot Deck in Photoshop', href: '/blog/design-your-own-tarot-deck' },
];

interface BorderPageProps {
  params: { slug: string };
}

const MARBLE_TEMPLE_META = {
  title: 'Marble Temple Border – Tarot Card Border Template',
  description:
    'Download the Marble Temple tarot border template — classical marble columns and arched window. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/marble-temple',
};

const VINTAGE_VELVET_META = {
  title: 'Vintage Velvet Border – Tarot Card Border Template',
  description:
    'Download the Vintage Velvet tarot border template — ornate gold flourishes on rich velvet, inspired by Victorian tarot design. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/vintage-velvet',
};

const CELESTIAL_GILDED_META = {
  title: 'Celestial Gilded Border – Tarot Card Border Template',
  description:
    'Download the Celestial Gilded tarot border template — gold celestial linework with stars and cosmic ornament. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/celestial-gilded',
};

const STEAMPUNK_BRASS_META = {
  title: 'Steampunk Brass Border – Tarot Card Border Template',
  description:
    'Download the Steampunk Brass tarot border template — ornate brass gears, gauges and mechanical detailing. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/steampunk-brass',
};

const JAPANESE_ZEN_META = {
  title: 'Japanese Zen Border – Tarot Card Border Template',
  description:
    'Download the Japanese Zen tarot border template — hand-painted cherry blossoms, bamboo, clouds and seigaiha waves on warm cream. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/japanese-zen',
};

const ENCHANTED_FOREST_META = {
  title: 'Enchanted Forest Border – Tarot Card Border Template',
  description:
    'Download the Enchanted Forest tarot border template — twisted woodland vines, oak leaves, acorns, moss and glowing fireflies. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/enchanted-forest',
};

const DAY_OF_THE_DEAD_META = {
  title: 'Day of the Dead Border – Tarot Card Border Template',
  description:
    'Download the Day of the Dead tarot border template — decorated sugar skulls, marigolds and papel picado. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/day-of-the-dead',
};

const OCEAN_MERMAID_META = {
  title: 'Ocean Depths Border – Tarot Card Border Template',
  description:
    'Download the Ocean Depths tarot border template — turquoise seaweed ribbons, coral pink branches, pearls, shells, starfish and shimmering bubbles. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/ocean-mermaid',
};

const DRAGON_SCALE_META = {
  title: 'Dragon Scale Border – Tarot Card Border Template',
  description:
    'Download the Dragon Scale tarot border template — layered dragon scales, bronze plaques and fantasy spikes. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/dragon-scale',
};

const GOTHIC_ROMANCE_META = {
  title: 'Gothic Romance Border – Tarot Card Border Template',
  description:
    'Download the Gothic Romance tarot border template — Victorian engraving, bats, thorny roses and Gothic spires on aged parchment. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/gothic-romance',
};

const ART_NOUVEAU_LILY_META = {
  title: 'Art Nouveau Lily Border – Tarot Card Border Template',
  description:
    'Download the Art Nouveau Lily tarot border template — cream and peach lilies, golden whiplash curves and blush pink Belle Époque florals. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/art-nouveau-lily',
};

const MYSTIC_CANDLELIGHT_META = {
  title: 'Mystic Candlelight Border – Tarot Card Border Template',
  description:
    'Download the Mystic Candlelight tarot border template — melting honey-amber wax, corner candles and warm ritual glow. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.',
  canonical: 'https://www.tarotcardtemplates.com/borders/mystic-candlelight',
};

const HAS_FULL_LAYOUT = (s: string) =>
  s === 'marble-temple' ||
  s === 'vintage-velvet' ||
  s === 'celestial-gilded' ||
  s === 'steampunk-brass' ||
  s === 'japanese-zen' ||
  s === 'enchanted-forest' ||
  s === 'day-of-the-dead' ||
  s === 'ocean-mermaid' ||
  s === 'dragon-scale' ||
  s === 'gothic-romance' ||
  s === 'art-nouveau-lily' ||
  s === 'mystic-candlelight';

export async function generateMetadata({
  params,
}: BorderPageProps): Promise<Metadata> {
  const border = borders[params.slug];
  if (!border) {
    return { title: 'Border Not Found' };
  }
  if (params.slug === 'marble-temple') {
    return {
      title: MARBLE_TEMPLE_META.title,
      description: MARBLE_TEMPLE_META.description,
      alternates: { canonical: MARBLE_TEMPLE_META.canonical },
      openGraph: { title: MARBLE_TEMPLE_META.title },
    };
  }
  if (params.slug === 'vintage-velvet') {
    return {
      title: VINTAGE_VELVET_META.title,
      description: VINTAGE_VELVET_META.description,
      alternates: { canonical: VINTAGE_VELVET_META.canonical },
      openGraph: { title: VINTAGE_VELVET_META.title },
    };
  }
  if (params.slug === 'celestial-gilded') {
    return {
      title: CELESTIAL_GILDED_META.title,
      description: CELESTIAL_GILDED_META.description,
      alternates: { canonical: CELESTIAL_GILDED_META.canonical },
      openGraph: { title: CELESTIAL_GILDED_META.title },
    };
  }
  if (params.slug === 'steampunk-brass') {
    return {
      title: STEAMPUNK_BRASS_META.title,
      description: STEAMPUNK_BRASS_META.description,
      alternates: { canonical: STEAMPUNK_BRASS_META.canonical },
      openGraph: { title: STEAMPUNK_BRASS_META.title },
    };
  }
  if (params.slug === 'japanese-zen') {
    return {
      title: JAPANESE_ZEN_META.title,
      description: JAPANESE_ZEN_META.description,
      alternates: { canonical: JAPANESE_ZEN_META.canonical },
      openGraph: { title: JAPANESE_ZEN_META.title },
    };
  }
  if (params.slug === 'enchanted-forest') {
    return {
      title: ENCHANTED_FOREST_META.title,
      description: ENCHANTED_FOREST_META.description,
      alternates: { canonical: ENCHANTED_FOREST_META.canonical },
      openGraph: { title: ENCHANTED_FOREST_META.title },
    };
  }
  if (params.slug === 'day-of-the-dead') {
    return {
      title: DAY_OF_THE_DEAD_META.title,
      description: DAY_OF_THE_DEAD_META.description,
      alternates: { canonical: DAY_OF_THE_DEAD_META.canonical },
      openGraph: { title: DAY_OF_THE_DEAD_META.title },
    };
  }
  if (params.slug === 'ocean-mermaid') {
    return {
      title: OCEAN_MERMAID_META.title,
      description: OCEAN_MERMAID_META.description,
      alternates: { canonical: OCEAN_MERMAID_META.canonical },
      openGraph: { title: OCEAN_MERMAID_META.title },
    };
  }
  if (params.slug === 'dragon-scale') {
    return {
      title: DRAGON_SCALE_META.title,
      description: DRAGON_SCALE_META.description,
      alternates: { canonical: DRAGON_SCALE_META.canonical },
      openGraph: { title: DRAGON_SCALE_META.title },
    };
  }
  if (params.slug === 'gothic-romance') {
    return {
      title: GOTHIC_ROMANCE_META.title,
      description: GOTHIC_ROMANCE_META.description,
      alternates: { canonical: GOTHIC_ROMANCE_META.canonical },
      openGraph: { title: GOTHIC_ROMANCE_META.title },
    };
  }
  if (params.slug === 'art-nouveau-lily') {
    return {
      title: ART_NOUVEAU_LILY_META.title,
      description: ART_NOUVEAU_LILY_META.description,
      alternates: { canonical: ART_NOUVEAU_LILY_META.canonical },
      openGraph: { title: ART_NOUVEAU_LILY_META.title },
    };
  }
  if (params.slug === 'mystic-candlelight') {
    return {
      title: MYSTIC_CANDLELIGHT_META.title,
      description: MYSTIC_CANDLELIGHT_META.description,
      alternates: { canonical: MYSTIC_CANDLELIGHT_META.canonical },
      openGraph: { title: MYSTIC_CANDLELIGHT_META.title },
    };
  }
  const title = `${border.name} Tarot Card Border Template`;
  return {
    title,
    description:
      params.slug === 'minimal-line'
        ? 'Download the Minimal Line tarot border template — clean geometric frame for modern and AI-generated tarot decks. PNG, PSD and Canva. 70×120mm, 3mm bleed. $9.95.'
        : border.description,
  };
}

/**
 * Pre-render every border slug at build time so each `/borders/[slug]` path exists in the build output.
 * Helps hosts (e.g. Netlify Next runtime) that rely on static path discovery; new slugs still work at
 * runtime when `dynamicParams` is left at the default `true`.
 */
export function generateStaticParams() {
  return BORDER_TEMPLATES.map((b) => ({ slug: b.slug }));
}

export default function BorderPage({ params }: BorderPageProps) {
  const { slug } = params;
  const border = borders[slug];

  if (!border) {
    notFound();
  }

  const videoTitle = `How to Design Tarot Cards Using the ${border.name}`;

  const marbleTempleProductSchema = slug === 'marble-temple' && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Marble Temple Tarot Border Template',
    description:
      'Classical marble tarot card border template with fluted columns and an arched window for tarot artwork.',
    brand: { '@type': 'Brand', name: 'Tarot Card Templates' },
    offers: {
      '@type': 'Offer',
      price: '9.95',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://www.tarotcardtemplates.com/borders/marble-temple',
    },
  };

  return (
    <div className="space-y-10 bg-cream -mx-6 -my-12 px-6 py-12">
      {marbleTempleProductSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(marbleTempleProductSchema) }}
        />
      )}
      <Link
        href="/"
        className="inline-block text-sm underline underline-offset-4 text-charcoal/80 hover:text-charcoal"
      >
        ← Back to home
      </Link>

      <header>
        <h1 className="text-3xl font-semibold text-charcoal">
          {slug === 'marble-temple'
            ? 'Marble Temple Border'
            : slug === 'vintage-velvet'
              ? 'Vintage Velvet Border'
              : slug === 'celestial-gilded'
                ? 'Celestial Gilded Border'
                : slug === 'steampunk-brass'
                  ? 'Steampunk Brass Border'
                  : slug === 'japanese-zen'
                    ? 'Japanese Zen Border'
                    : slug === 'enchanted-forest'
                      ? 'Enchanted Forest Border'
                      : slug === 'day-of-the-dead'
                        ? 'Day of the Dead Border'
                    : slug === 'ocean-mermaid'
                      ? 'Ocean Depths Border'
                      : slug === 'dragon-scale'
                        ? 'Dragon Scale Border'
                        : slug === 'gothic-romance'
                          ? 'Gothic Romance Border'
                          : slug === 'art-nouveau-lily'
                            ? 'Art Nouveau Lily Border'
                            : slug === 'mystic-candlelight'
                              ? 'Mystic Candlelight Border'
                              : `${border.name} Tarot Card Border Template`}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="relative aspect-[3/5] w-full max-w-sm overflow-hidden rounded-sm border border-charcoal/10 bg-cream p-4">
            <Image
              src={border.image}
              alt={border.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Product Description — under image for all border pages */}
          {border.productDescription && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-charcoal">Product Description</h2>
              {border.productDescription.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-charcoal/80">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <p className="text-charcoal/90">{border.description}</p>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-charcoal">
              Perfect for:
            </h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-charcoal/80">
              <li>tarot decks</li>
              <li>oracle decks</li>
              <li>affirmation cards</li>
              <li>printable spiritual products</li>
            </ul>
          </div>

          {/* How It Works — in sidebar for all border pages */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">How It Works</h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-charcoal/80">
              <li>Purchase the {border.name} template.</li>
              <li>Create a free account and log in to Tarot Studio.</li>
              <li>Upload your tarot artwork into the template.</li>
              <li>Add card titles and numerals inside the frame.</li>
              <li>Export your finished tarot cards as print-ready files.</li>
              <li>Optional: order professional tarot card printing through our printing partners.</li>
            </ul>
          </div>

          {/* Full layout sidebar: Price, Purchase button, Included Files, Template Features */}
          {HAS_FULL_LAYOUT(slug) ? (
            <>
              <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-charcoal">
                  Border Template – Studio
                </h2>
                <p className="mb-4 text-charcoal/90">
                  <span className="font-medium">Price: $9.95</span>
                </p>
                <button
                  type="button"
                  className="w-full border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
                >
                  Purchase
                </button>
                <p className="mt-3 text-sm text-charcoal/70">
                  After payment you&apos;ll design each card in the Studio.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-charcoal">
                  Included files:
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-charcoal/80">
                  <li>PNG border</li>
                  <li>PSD layered file</li>
                  <li>Canva compatible</li>
                  <li>70×120mm tarot card size</li>
                  <li>3mm bleed included</li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-charcoal">
                  Template Features
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-charcoal/80">
                  <li>Transparent artwork window</li>
                  <li>Standard tarot size (70 × 120 mm)</li>
                  <li>3 mm bleed for professional printing</li>
                  <li>PNG and PSD template files</li>
                  <li>Compatible with Canva and Photoshop</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-charcoal">
                  Included files:
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-charcoal/80">
                  <li>PNG border</li>
                  <li>PSD layered file</li>
                  <li>Canva compatible</li>
                  <li>70×120mm tarot card size</li>
                  <li>3mm bleed included</li>
                </ul>
              </div>
              <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-charcoal">
                  Border Template – Studio
                </h2>
                <p className="mb-4 text-charcoal/90">
                  <span className="font-medium">Price: $9.95</span>
                </p>
                <p className="mb-2 text-sm font-medium text-charcoal/80">Includes:</p>
                <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-charcoal/80">
                  <li>PNG border</li>
                  <li>PSD layered file</li>
                  <li>Canva compatible</li>
                  <li>70×120mm tarot card size</li>
                  <li>3mm bleed included</li>
                </ul>
                <button
                  type="button"
                  className="w-full border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
                >
                  Purchase
                </button>
                <p className="mt-3 text-sm text-charcoal/70">
                  After payment you&apos;ll design each card in the Studio.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Example Cards — product-focused heading for full-layout borders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-charcoal">
          {HAS_FULL_LAYOUT(slug) ? 'Example Tarot Cards Created With This Border' : 'Example Usage'}
        </h2>
        {slug === 'vintage-velvet' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VINTAGE_VELVET_EXAMPLES.map((example) => (
                <div key={example.src} className="space-y-2">
                  <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                    <Image
                      src={example.src}
                      alt={example.alt}
                      fill
                      className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : slug === 'minimal-line' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/minimal-line-example-1.png"
                    alt="Minimal line tarot card template example with celestial tarot illustration"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Celestial Tarot Illustration</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/minimal-line-example-2.png"
                    alt="Minimal line tarot card template example with vintage occult tarot artwork"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Vintage Occult Tarot Illustration</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/minimal-line-example-3.png"
                    alt="Minimal line tarot card template example with dark fantasy tarot illustration"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Dark Fantasy Tarot Illustration</p>
              </div>
            </div>
          </>
        ) : slug === 'celestial-gilded' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/celestial-gilded-example-1.png"
                    alt="Celestial Gilded tarot border example — celestial moon tarot card illustration"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Celestial Moon Tarot Illustration</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/celestial-gilded-example-2.png"
                    alt="Celestial Gilded tarot border example — mystical astrology tarot card artwork"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Mystical Astrology Tarot Art</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/celestial-gilded-example-3.png"
                    alt="Celestial Gilded tarot border example — traditional tarot illustration with gold celestial frame"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Traditional Tarot Illustration</p>
              </div>
            </div>
          </>
        ) : slug === 'marble-temple' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {MARBLE_TEMPLE_EXAMPLES.map((example) => (
                <div key={example.src} className="space-y-2">
                  <div className="relative aspect-[3/5] overflow-hidden rounded-md border border-charcoal/10 shadow-md shadow-charcoal/15">
                    <Image
                      src={example.src}
                      alt={example.alt}
                      fill
                      className="object-contain rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                    />
                  </div>
                  <p className="text-center text-xs text-charcoal/80">{example.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : slug === 'steampunk-brass' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/steampunk-brass-example-1.png"
                    alt="Steampunk Brass tarot border example showing finished card artwork with brass gear frame"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/steampunk-brass-example-2.png"
                    alt="Steampunk Brass tarot border with mechanical brass detailing on a completed tarot card"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/steampunk-brass-example-3.png"
                    alt="Completed tarot card using the Steampunk Brass border template with Victorian mechanical aesthetic"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : slug === 'japanese-zen' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/japanese-zen-example-1.png"
                    alt="Japanese Zen tarot border example — Knight of Cups card with watercolor mountains and cherry blossoms"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/japanese-zen-example-2.png"
                    alt="Japanese Zen tarot border example — Strength card with woman and tiger in a mountain landscape"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/japanese-zen-example-3.png"
                    alt="Japanese Zen tarot border example — The Fool card with monk and fox spirit on a cliff"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : slug === 'enchanted-forest' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/enchanted-forest-example-1.png"
                    alt="Enchanted Forest tarot border example — The Empress card in a glowing woodland clearing"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/enchanted-forest-example-2.png"
                    alt="Enchanted Forest tarot border example — Death card with cloaked figure and forest graveyard"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/enchanted-forest-example-3.png"
                    alt="Enchanted Forest tarot border example — Page of Wands traveling through a lantern-lit forest path"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : slug === 'day-of-the-dead' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/day-of-the-dead-example-1.png"
                    alt="Day of the Dead tarot border example — The Devil card with sugar skull festival design"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/day-of-the-dead-example-2.png"
                    alt="Day of the Dead tarot border example — The Lovers card with sugar skull festival design"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/day-of-the-dead-example-3.png"
                    alt="Day of the Dead tarot border example — The Magician card with sugar skull festival design"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : slug === 'ocean-mermaid' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/ocean-mermaid-example-1.png"
                    alt="Ocean/Mermaid tarot border example — Ace of Pentacles card with underwater treasures"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/ocean-mermaid-example-2.png"
                    alt="Ocean/Mermaid tarot border example — Page of Wands card with mermaid sea scene"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/ocean-mermaid-example-3.png"
                    alt="Ocean/Mermaid tarot border example — The Lovers card with underwater harmony"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : slug === 'gothic-romance' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/gothic-romance-example-1.png"
                    alt="Gothic Romance tarot border example — Ace of Swords with crowned sword and radiant light"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Ace of Swords</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/gothic-romance-example-2.png"
                    alt="Gothic Romance tarot border example — Three of Wands on a cliff overlooking the sea"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Three of Wands</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/gothic-romance-example-3.png"
                    alt="Gothic Romance tarot border example — Two of Pentacles balancing pentacles in ocean waves"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Two of Pentacles</p>
              </div>
            </div>
          </>
        ) : slug === 'art-nouveau-lily' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/art-nouveau-lily-example-1.png"
                    alt="Art Nouveau Lily tarot border example — The World with celestial figure and rose wreath"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">The World</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/art-nouveau-lily-example-2.png"
                    alt="Art Nouveau Lily tarot border example — The Hanged Man beneath a blossoming tree"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">The Hanged Man</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/art-nouveau-lily-example-3.png"
                    alt="Art Nouveau Lily tarot border example — The Empress on a throne among white lilies"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">The Empress</p>
              </div>
            </div>
          </>
        ) : slug === 'mystic-candlelight' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {MYSTIC_CANDLELIGHT_EXAMPLES.map((example) => (
                <div key={example.src} className="space-y-2">
                  <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                    <Image
                      src={example.src}
                      alt={example.alt}
                      fill
                      className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                    />
                  </div>
                  <p className="text-center text-xs text-charcoal/80">{example.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : slug === 'dragon-scale' ? (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks when used with finished tarot artwork.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/dragon-scale-example-1.png"
                    alt="Dragon Scale tarot border example — Eight of Wands with flaming wands and mountain landscape"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Eight of Wands</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/dragon-scale-example-2.png"
                    alt="Dragon Scale tarot border example — King of Swords on a throne of blades"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">King of Swords</p>
              </div>
              <div className="space-y-2">
                <div className="relative aspect-[3/5] overflow-hidden rounded-md bg-cream shadow-md shadow-charcoal/15">
                  <Image
                    src="/images/examples/dragon-scale-example-3.png"
                    alt="Dragon Scale tarot border example — Ace of Cups with golden chalice and lilies"
                    fill
                    className="object-cover rounded-md transition-transform duration-200 ease-out hover:scale-[1.03]"
                  />
                </div>
                <p className="text-center text-xs text-charcoal/80">Ace of Cups</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-charcoal/80">
              See how this border looks on finished tarot cards.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative aspect-[3/5] overflow-hidden rounded-md border border-charcoal/10 bg-cream p-2 shadow-sm"
                >
                  <Image
                    src={border.image}
                    alt={`${border.name} example ${i}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {HAS_FULL_LAYOUT(slug) ? (
        <>
          {/* Related Templates */}
          <section className="space-y-4 border-t border-charcoal/10 pt-10">
            <h2 className="text-xl font-semibold text-charcoal">You May Also Like</h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {getRelatedBorders(slug).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/borders/${b.slug}`}
                    className="block rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-colors hover:border-charcoal/20"
                  >
                    <span className="font-medium text-charcoal">{b.name}</span>
                    <p className="mt-1 text-xs text-charcoal/80">
                      {b.slug === 'celestial-gilded' &&
                        'Elegant gold celestial linework with stars and cosmic ornament.'}
                      {b.slug === 'minimal-line' &&
                        'Clean geometric frame for modern and AI-generated tarot decks.'}
                      {b.slug === 'vintage-velvet' &&
                        'Rich velvet texture with ornate gold baroque flourishes.'}
                      {b.slug === 'marble-temple' &&
                        'Classical marble columns and an arched window for traditional tarot styles.'}
                      {b.slug === 'steampunk-brass' &&
                        'Ornate brass gears and mechanical detailing for Victorian-inspired decks.'}
                      {b.slug === 'day-of-the-dead' &&
                        'Vibrant Día de los Muertos sugar skulls, marigolds and papel picado.'}
                      {b.slug === 'ocean-mermaid' &&
                        'Underwater seaweed ribbons, coral branches, pearls, shells and starfish.'}
                      {b.slug === 'dragon-scale' &&
                        'Layered dragon scales, bronze plaques and armored spikes for epic fantasy decks.'}
                      {b.slug === 'gothic-romance' &&
                        'Victorian engraving on parchment with bats, roses, Gothic spires and moonlit romantic detail.'}
                      {b.slug === 'art-nouveau-lily' &&
                        'Belle Époque lilies, golden whiplash curves and blush pink florals in true Art Nouveau style.'}
                      {b.slug === 'mystic-candlelight' &&
                        'Honey-amber melting wax, corner candle flames and organic drips for witchy ritual decks.'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Learn How to Design */}
          <section className="space-y-4 border-t border-charcoal/10 pt-10">
            <h2 className="text-xl font-semibold text-charcoal">
              Learn How to Design Tarot Cards With This Border
            </h2>
            <p className="text-sm text-charcoal/80">
              Step-by-step guides to create your own tarot deck using this border style.
            </p>
            <ul className="space-y-3">
              {TUTORIAL_LINKS.map((tutorial) => (
                <li key={tutorial.href}>
                  <p className="text-charcoal font-medium">{tutorial.label}</p>
                  <Link
                    href={tutorial.href}
                    className="text-sm underline underline-offset-4 text-charcoal/80 hover:text-charcoal"
                  >
                    Read the tutorial →
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-medium text-charcoal">{videoTitle}</h3>
              <div className="relative w-full overflow-hidden rounded-md border border-charcoal/10 bg-charcoal/5 pb-[56.25%]">
                <iframe
                  title={videoTitle}
                  className="absolute left-0 top-0 h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Other borders: Product Description then Tutorial then SEO section */}
          <section className="space-y-4 border-t border-charcoal/10 pt-10">
            <h2 className="text-xl font-semibold text-charcoal">Product Description</h2>
            {border.productDescription.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-charcoal/80">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="space-y-4 border-t border-charcoal/10 pt-10">
            <h2 className="text-xl font-semibold text-charcoal">
              Learn How to Design Tarot Cards With This Border
            </h2>
            <p className="text-sm text-charcoal/80">
              Step-by-step guides to create your own tarot deck using this border style.
            </p>
            <ul className="space-y-3">
              {TUTORIAL_LINKS.map((tutorial) => (
                <li key={tutorial.href}>
                  <p className="text-charcoal font-medium">{tutorial.label}</p>
                  <Link
                    href={tutorial.href}
                    className="text-sm underline underline-offset-4 text-charcoal/80 hover:text-charcoal"
                  >
                    Read the tutorial →
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-medium text-charcoal">{videoTitle}</h3>
              <div className="relative w-full overflow-hidden rounded-md border border-charcoal/10 bg-charcoal/5 pb-[56.25%]">
                <iframe
                  title={videoTitle}
                  className="absolute left-0 top-0 h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-charcoal">
              Design Your Own Tarot Deck Using This Template
            </h2>
            <p className="text-sm text-charcoal/80">
              Creating your own tarot deck starts with a consistent card layout. A tarot card template provides the correct
              proportions, safe areas, and border placement needed to design professional looking cards. This{' '}
              {border.name.toLowerCase()} template was designed specifically for standard tarot card dimensions and works
              perfectly with both traditional tarot illustrations and modern digital artwork.
            </p>
            <p className="text-sm text-charcoal/80">
              Whether you are designing a Rider–Waite inspired deck, an illustrated fantasy tarot deck, or experimenting
              with AI generated artwork, this tarot card border template makes it easy to place your artwork inside a
              finished card frame. Simply drop your illustration into the center artwork area and your tarot card is ready
              for printing.
            </p>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-charcoal">
                This template is ideal for:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-charcoal/80">
                <li>Designing your own tarot deck</li>
                <li>Creating tarot cards for print-on-demand</li>
                <li>AI generated tarot artwork</li>
                <li>Photoshop or Canva tarot layouts</li>
                <li>Professional tarot card publishing</li>
              </ul>
            </div>
            <p className="text-sm text-charcoal/80">
              If you are learning how to make your own tarot cards, starting with a ready-made tarot card template can save
              hours of layout work. The {border.name} template ensures your artwork fits perfectly within a classic
              tarot card frame while maintaining the correct proportions used by most tarot decks.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
