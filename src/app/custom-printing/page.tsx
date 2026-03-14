import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Custom Tarot Deck Printing | Professional Print Services | TarotCardTemplates.com',
  description:
    'Print your tarot deck professionally. Premium card stock, prototype decks, custom packaging, worldwide shipping. Built for creators and artists.',
};

const TRUST_BULLETS = [
  'Premium tarot card stock',
  'Prototype decks available',
  'Custom packaging options',
  'Worldwide shipping',
];

const HOW_IT_WORKS_STEPS = [
  { step: 1, title: 'Choose a Template', body: 'Browse tarot templates or upload your own artwork.' },
  { step: 2, title: 'Design Your Cards', body: 'Create your tarot card illustrations and titles.' },
  { step: 3, title: 'Upload Your Deck', body: 'Submit final artwork files ready for printing.' },
  { step: 4, title: 'Print Your Deck', body: 'We print and ship your tarot deck worldwide.' },
];

const PRODUCT_IMAGES = [
  { label: 'Deck in box' },
  { label: 'Card fan spread' },
  { label: 'Close-up card texture' },
  { label: 'Deck shuffle' },
];

const PROTOTYPE_BLOCKS = [
  { title: 'Prototype Deck', body: 'Perfect for testing your tarot deck design.' },
  { title: 'Small Batch Printing', body: '50–100 decks for early creators.' },
  { title: 'Full Production Runs', body: 'Ideal for Kickstarter or retail launches.' },
];

const ARTWORK_CHECKLIST = [
  '300 DPI resolution',
  '898 × 1488 px card size',
  '3mm bleed included',
  'PNG or PDF format recommended',
];

const USE_CASES = [
  'Indie tarot creators',
  'Kickstarter tarot campaigns',
  'Etsy tarot sellers',
  'spiritual brands',
  'Artists launching their first tarot deck',
];

export default function CustomPrintingPage() {
  return (
    <div className="space-y-16 rounded-sm bg-[#f6f0e8] bg-[radial-gradient(circle_at_top,_rgba(214,186,140,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(155,126,189,0.16),_transparent_55%)]">
      {/* SECTION 1 — HERO */}
      <section className="relative -mx-8 overflow-hidden rounded-sm bg-gradient-to-b from-cream/95 via-cream/98 to-[#f6f0e8] px-8 py-12">
        <div className="relative z-10 space-y-6 text-center md:text-left">
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-charcoal md:text-5xl">
            Print Your Tarot Deck Professionally
          </h1>
          <p className="max-w-2xl text-lg text-charcoal/80">
            Turn your tarot designs into a real printed deck — perfect for creators, tarot readers,
            artists, and Kickstarter campaigns.
          </p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-charcoal/80 md:justify-start">
            {TRUST_BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#C7A96B]" aria-hidden>✔</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-4 pt-2 md:justify-start">
            <Link
              href="#"
              className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream shadow-[0_14px_35px_rgba(15,23,42,0.32)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.35)]"
            >
              Print My Deck
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal shadow-sm transition-colors duration-150 hover:border-amber-500 hover:bg-cream"
            >
              Order Sample Deck
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PRODUCT VISUALS */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_IMAGES.map(({ label }) => (
            <div
              key={label}
              className="aspect-[3/4] overflow-hidden rounded-sm border border-charcoal/10 bg-cream/80"
              title={label}
            >
              <div className="flex h-full w-full items-center justify-center bg-charcoal/5 text-xs text-charcoal/50">
                {label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-charcoal/70">
          Professional tarot card printing built for creators and artists.
        </p>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-charcoal">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map(({ step, title, body }) => (
            <div key={step} className="rounded-sm border border-charcoal/10 bg-cream/80 p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-[#C7A96B]">
                Step {step}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-charcoal">{title}</h3>
              <p className="mt-2 text-sm text-charcoal/80">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PRINTING SPECIFICATIONS */}
      <section className="rounded-sm border border-charcoal/10 bg-cream/80 p-8">
        <h2 className="text-2xl font-semibold text-charcoal">
          Tarot Card Printing Specifications
        </h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-charcoal">Card Size</dt>
            <dd className="mt-1 text-sm text-charcoal/80">70 × 120 mm (standard tarot size)</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">Card Stock Options</dt>
            <dd className="mt-1 text-sm text-charcoal/80">
              <ul className="list-inside list-disc space-y-0.5">
                <li>300gsm smooth card stock</li>
                <li>350gsm premium black core</li>
                <li>Linen textured finish</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">Finishes</dt>
            <dd className="mt-1 text-sm text-charcoal/80">
              <ul className="list-inside list-disc space-y-0.5">
                <li>Matte finish</li>
                <li>Gloss finish</li>
                <li>Linen finish</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">Corner Style</dt>
            <dd className="mt-1 text-sm text-charcoal/80">Rounded tarot corners</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">Packaging Options</dt>
            <dd className="mt-1 text-sm text-charcoal/80">
              <ul className="list-inside list-disc space-y-0.5">
                <li>Tuck box</li>
                <li>Rigid collector box</li>
                <li>Foil stamped box</li>
              </ul>
            </dd>
          </div>
        </dl>
      </section>

      {/* SECTION 5 — PROTOTYPE DECKS */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal">
            Print a Prototype Deck First
          </h2>
          <p className="mt-3 max-w-2xl text-charcoal/80">
            Before printing a full run, test your design with a real deck.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROTOTYPE_BLOCKS.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-sm border border-charcoal/10 bg-cream/80 p-6"
            >
              <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
              <p className="mt-2 text-sm text-charcoal/80">{body}</p>
            </div>
          ))}
        </div>
        <div>
          <Link
            href="#"
            className="inline-block rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
          >
            Order Prototype Deck
          </Link>
        </div>
      </section>

      {/* SECTION 6 — TEMPLATE INTEGRATION */}
      <section className="rounded-sm border border-charcoal/10 bg-cream/80 p-8">
        <h2 className="text-2xl font-semibold text-charcoal">
          Already Using One of Our Templates?
        </h2>
        <p className="mt-3 max-w-2xl text-charcoal/80">
          Your tarot template is already formatted perfectly for printing. Simply export your
          artwork and upload your files to start production.
        </p>
        <Link
          href="/templates"
          className="mt-6 inline-block rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
        >
          Print This Template
        </Link>
      </section>

      {/* SECTION 7 — ARTWORK PREPARATION GUIDE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-charcoal">
          Preparing Your Tarot Deck for Printing
        </h2>
        <ul className="list-inside list-disc space-y-2 text-charcoal/80">
          {ARTWORK_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          href="#"
          className="inline-block rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-amber-500 hover:bg-cream"
        >
          Download Print Guide
        </Link>
      </section>

      {/* SECTION 8 — CREATOR USE CASES */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-charcoal">
          Who Uses Our Tarot Printing Service
        </h2>
        <ul className="flex flex-wrap gap-3">
          {USE_CASES.map((item) => (
            <li
              key={item}
              className="rounded-sm border border-charcoal/20 bg-cream/80 px-4 py-2 text-sm text-charcoal/80"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="rounded-sm bg-gradient-to-b from-cream/95 to-[#f6f0e8] px-8 py-12 text-center">
        <h2 className="text-3xl font-semibold text-charcoal md:text-4xl">
          Ready to Print Your Tarot Deck?
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="#"
            className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream shadow-[0_14px_35px_rgba(15,23,42,0.32)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.35)]"
          >
            Start Printing
          </Link>
          <Link
            href="#"
            className="rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-amber-500 hover:bg-cream"
          >
            Order Prototype
          </Link>
          <Link
            href="#"
            className="rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-amber-500 hover:bg-cream"
          >
            Contact Printing Team
          </Link>
        </div>
      </section>
    </div>
  );
}
