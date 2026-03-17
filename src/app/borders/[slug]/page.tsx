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
    alt: 'vintage velvet tarot border example with rider waite page of wands',
  },
  {
    src: '/images/examples/vintage-velvet-border-tarot-example-2.png',
    alt: 'vintage velvet tarot border example with celestial tarot illustration',
  },
  {
    src: '/images/examples/vintage-velvet-border-tarot-example-3.png',
    alt: 'vintage velvet tarot border example with classic tarot queen illustration',
  },
];

const MARBLE_TEMPLE_EXAMPLES = [
  { src: '/images/examples/marble-temple-example-1.png', alt: 'Marble Temple tarot border example – The Fool', label: 'The Fool' },
  { src: '/images/examples/marble-temple-example-2.png', alt: 'Marble Temple tarot border example – The High Priestess', label: 'The High Priestess' },
  { src: '/images/examples/marble-temple-example-3.png', alt: 'Marble Temple tarot border example – Three of Swords', label: 'Three of Swords' },
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
    'Download the Marble Temple tarot card border template for Canva and Photoshop. Classical marble frame with transparent center for tarot artwork. Instant download.',
  canonical: 'https://www.tarotcardtemplates.com/borders/marble-temple',
};

const VINTAGE_VELVET_META = {
  title: 'Vintage Velvet Border – Tarot Card Border Template',
  description:
    'Download the Vintage Velvet tarot card border template for Canva and Photoshop. Ornate golden flourishes and velvet-style frame with transparent center. Instant download.',
  canonical: 'https://www.tarotcardtemplates.com/borders/vintage-velvet',
};

const CELESTIAL_GILDED_META = {
  title: 'Celestial Gilded Border – Tarot Card Border Template',
  description:
    'Download the Celestial Gilded tarot card border template for Canva and Photoshop. Celestial gold linework frame with transparent center for tarot artwork. Instant download.',
  canonical: 'https://www.tarotcardtemplates.com/borders/celestial-gilded',
};

const HAS_FULL_LAYOUT = (s: string) =>
  s === 'marble-temple' || s === 'vintage-velvet' || s === 'celestial-gilded';

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
  const title = `${border.name} Tarot Card Border Template`;
  return {
    title,
    description: border.description,
  };
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
                : `${border.name} Tarot Card Border Template`}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative aspect-[3/5] w-full max-w-sm overflow-hidden rounded-sm border border-charcoal/10 bg-cream p-4">
          <Image
            src={border.image}
            alt={border.name}
            fill
            className="object-contain"
          />
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

          {/* How It Works — in sidebar for full-layout borders */}
          {HAS_FULL_LAYOUT(slug) && (
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
          )}

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
                    alt="Celestial gilded tarot card border template example with moon themed tarot illustration"
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
                    alt="Celestial gilded tarot card border template example with astrology inspired tarot artwork"
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
                    alt="Celestial gilded tarot card border template example with traditional tarot card illustration"
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
          {/* 3. Product Description — from border data */}
          <section className="space-y-4 border-t border-charcoal/10 pt-10">
            <h2 className="text-xl font-semibold text-charcoal">Product Description</h2>
            {border.productDescription.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-charcoal/80">
                {paragraph}
              </p>
            ))}
          </section>

          {/* 4. Related Templates */}
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
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Tutorials / Blog */}
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
