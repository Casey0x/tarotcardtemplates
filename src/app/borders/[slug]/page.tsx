import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const borders: Record<
  string,
  { name: string; image: string; description: string }
> = {
  'celestial-gilded': {
    name: 'Celestial Gilded Border',
    image: '/images/template-styles/celestial-gilded.png',
    description:
      'Elegant celestial tarot border featuring flowing botanical ornament and gold celestial motifs.',
  },
  'minimal-line': {
    name: 'Minimal Line Border',
    image: '/images/template-styles/minimal-line-arcana.png',
    description:
      'Clean minimalist tarot border designed for modern tarot decks and simple layouts.',
  },
  'vintage-velvet': {
    name: 'Vintage Velvet Border',
    image: '/images/template-styles/vintage-velvet.png',
    description:
      'Luxurious baroque tarot border with velvet textures and dramatic gold ornament.',
  },
};

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

const TUTORIAL_LINKS = [
  { label: 'How to Create Tarot Cards in Canva', href: '/blog/create-tarot-cards-canva' },
  { label: 'How to Design a Tarot Deck in Photoshop', href: '/blog/design-your-own-tarot-deck' },
];

interface BorderPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BorderPageProps): Promise<Metadata> {
  const border = borders[params.slug];
  if (!border) {
    return { title: 'Border Not Found' };
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

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="inline-block text-sm underline underline-offset-4 text-charcoal/80 hover:text-charcoal"
      >
        ← Back to home
      </Link>

      <header>
        <h1 className="text-3xl font-semibold text-charcoal">
          {border.name} Tarot Card Border Template
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

          {/* Purchase box — top right on desktop, below content on mobile */}
          <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-charcoal">
              Border Template Download
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
              className="border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
            >
              Buy Template
            </button>
          </div>
        </div>
      </div>

      {/* Example Usage — full width */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-charcoal">Example Usage</h2>
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

      {/* Tutorial / learning section */}
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

        {/* YouTube embed — replace video ID with your tutorial video */}
        <div className="mt-8">
          <h3 className="mb-3 text-lg font-medium text-charcoal">
            {videoTitle}
          </h3>
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

      {/* SEO-focused deck design section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-charcoal">
          Design Your Own Tarot Deck Using This Template
        </h2>
        <p className="text-sm text-charcoal/80">
          Creating your own tarot deck starts with a consistent card layout. A tarot card template provides the correct
          proportions, safe areas, and border placement needed to design professional looking cards. This vintage velvet
          border template was designed specifically for standard tarot card dimensions and works perfectly with both
          traditional tarot illustrations and modern digital artwork.
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
          hours of layout work. The Vintage Velvet Border template ensures your artwork fits perfectly within a classic
          tarot card frame while maintaining the correct proportions used by most tarot decks.
        </p>
      </section>
    </div>
  );
}
