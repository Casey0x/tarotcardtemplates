import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Custom Tarot Deck Printing | Professional Print Services | TarotCardTemplates.com',
  description:
    'Print your tarot deck professionally. Premium card stock, prototype decks, custom packaging, worldwide shipping. Built for creators and artists.',
};

const HERO_TRUST = [
  'Prototype decks from $49',
  'No minimums on small runs',
  'Ships worldwide',
  '500+ decks printed',
];

const PRODUCT_IMAGES = [
  { label: 'Tarot deck box' },
  { label: 'Fan spread of cards' },
  { label: 'Close-up card texture' },
  { label: 'Stacked deck' },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Choose a Template',
    body: 'Browse our print-ready templates or upload your artwork.',
  },
  {
    step: 2,
    title: 'Prepare Your Files',
    body: 'Export artwork at 300 DPI with 3mm bleed.',
  },
  {
    step: 3,
    title: 'Upload & Approve',
    body: 'We review your files and send a digital proof.',
  },
  {
    step: 4,
    title: 'Print & Ship',
    body: 'Your deck is printed, checked, and shipped worldwide.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The print quality exceeded my expectations. Colours matched my files exactly and the card stock feels premium.',
    focus: 'Print quality',
  },
  {
    quote:
      'Colour accuracy was spot-on. What I saw on screen is what I got in hand — no surprises.',
    focus: 'Colour accuracy',
  },
  {
    quote:
      'From approval to delivery was under two weeks. Perfect for my Kickstarter fulfilment.',
    focus: 'Production speed',
  },
];

export default function CustomPrintingPage() {
  return (
    <div
      className="space-y-20 rounded-sm bg-[#F7F3EA]"
      style={{ color: '#1B1B1B' }}
    >
      {/* SECTION 1 — HERO */}
      <section className="relative -mx-6 overflow-hidden rounded-sm bg-gradient-to-b from-[#F7F3EA] via-[#F7F3EA]/98 to-[#F7F3EA] px-6 py-14 md:-mx-8 md:px-8">
        <div className="relative z-10 mx-auto max-w-6xl space-y-6 text-center md:text-left">
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl" style={{ color: '#1B1B1B' }}>
            Professional Tarot Card Printing
          </h1>
          <p className="text-xl font-medium" style={{ color: '#1B1B1B' }}>
            Your artwork. Printed and in your hands.
          </p>
          <p className="max-w-2xl text-lg" style={{ color: '#555555' }}>
            From prototype decks to full production runs — premium card stock, worldwide shipping,
            and production timelines built for creators.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 md:justify-start">
            <Link
              href="#"
              className="rounded-sm border border-[#1B1B1B] bg-[#1B1B1B] px-6 py-3 text-sm font-medium text-[#F7F3EA] shadow-[0_14px_35px_rgba(27,27,27,0.32)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(27,27,27,0.35)]"
            >
              Print Prototype Deck
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-[#1B1B1B]/80 bg-[#F7F3EA] px-6 py-3 text-sm font-medium transition-colors hover:border-[#C7A96B] hover:bg-[#F7F3EA]"
              style={{ color: '#1B1B1B' }}
            >
              Download Print Guide
            </Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm md:justify-start" style={{ color: '#555555' }}>
            {HERO_TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }} aria-hidden>✔</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 2 — PRODUCT VISUALS */}
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_IMAGES.map(({ label }) => (
            <div
              key={label}
              className="aspect-[3/4] overflow-hidden rounded-lg border border-[#1B1B1B]/10 bg-white/80 shadow-sm"
              title={label}
            >
              <div
                className="flex h-full w-full items-center justify-center text-xs"
                style={{ backgroundColor: 'rgba(27,27,27,0.04)', color: '#555555' }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — PRICING */}
      <section className="mx-auto max-w-6xl space-y-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#1B1B1B' }}>
          Choose your print run
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* CARD 1 — Prototype */}
          <div className="flex flex-col rounded-lg border border-[#1B1B1B]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold" style={{ color: '#1B1B1B' }}>
              Prototype Deck
            </h3>
            <p className="mt-1 text-xl font-semibold" style={{ color: '#C7A96B' }}>
              $49 <span className="text-base font-normal" style={{ color: '#555555' }}>/ single deck</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: '#555555' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> 1 full 78-card deck
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> 300gsm smooth stock
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Rounded corners
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Tuck box included
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Ships in 5–7 days
              </li>
            </ul>
            <Link
              href="#"
              className="mt-6 block w-full rounded-sm border border-[#1B1B1B] bg-[#1B1B1B] py-3 text-center text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#1B1B1B]/90"
            >
              Print Prototype Deck
            </Link>
          </div>

          {/* CARD 2 — Small Batch (highlight) */}
          <div className="relative flex flex-col rounded-lg border-2 border-[#C7A96B] bg-white p-6 shadow-md">
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: '#C7A96B', color: '#F7F3EA' }}
            >
              Most Popular
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#1B1B1B' }}>
              Small Batch
            </h3>
            <p className="mt-1 text-xl font-semibold" style={{ color: '#C7A96B' }}>
              $6.50 <span className="text-base font-normal" style={{ color: '#555555' }}>/ deck · 50–200 decks</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: '#555555' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> 50–200 deck runs
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> 300gsm or 350gsm black core
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Matte, gloss, or linen finish
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Tuck or rigid box
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Ships in 10–14 days
              </li>
            </ul>
            <Link
              href="#"
              className="mt-6 block w-full rounded-sm border-2 border-[#C7A96B] py-3 text-center text-sm font-medium transition-colors hover:bg-[#C7A96B]/10"
              style={{ color: '#C7A96B' }}
            >
              Get Small Batch Quote
            </Link>
          </div>

          {/* CARD 3 — Full Production */}
          <div className="flex flex-col rounded-lg border border-[#1B1B1B]/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold" style={{ color: '#1B1B1B' }}>
              Full Production
            </h3>
            <p className="mt-1 text-xl font-semibold" style={{ color: '#C7A96B' }}>
              $3.20 <span className="text-base font-normal" style={{ color: '#555555' }}>/ deck · 500+ decks</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: '#555555' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> 500+ deck runs
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Premium stock & finishes
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Foil stamping
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Spot UV
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Rigid collector box option
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#C7A96B' }}>•</span> Ships in 3–4 weeks
              </li>
            </ul>
            <Link
              href="#"
              className="mt-6 block w-full rounded-sm border border-[#1B1B1B] bg-[#1B1B1B] py-3 text-center text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#1B1B1B]/90"
            >
              Start Production Run
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section className="mx-auto max-w-6xl space-y-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#1B1B1B' }}>
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map(({ step, title, body }) => (
            <div
              key={step}
              className="rounded-lg border border-[#1B1B1B]/10 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: '#C7A96B' }}>
                Step {step}
              </p>
              <h3 className="mt-2 text-lg font-semibold" style={{ color: '#1B1B1B' }}>
                {title}
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#555555' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — PRINT SPECIFICATIONS */}
      <section className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-[#1B1B1B]/10 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold" style={{ color: '#1B1B1B' }}>
            Tarot Card Print Specifications
          </h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Card Size</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>70 × 120 mm</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Resolution & Bleed</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>300 DPI · 3mm bleed<br />898 × 1488 px export</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Card Stock</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>300gsm smooth<br />350gsm black core</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Finishes</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>Matte · Gloss · Linen</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Packaging</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>Tuck box · Rigid collector box · Foil stamping</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>Corners</dt>
              <dd className="mt-1 text-sm" style={{ color: '#555555' }}>Rounded tarot corners</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* SECTION 6 — TEMPLATE INTEGRATION */}
      <section className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-[#1B1B1B]/10 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold" style={{ color: '#1B1B1B' }}>
            Already Using One of Our Tarot Templates?
          </h2>
          <p className="mt-3 max-w-2xl text-sm" style={{ color: '#555555' }}>
            Our tarot templates are already formatted for professional printing. Simply export your
            artwork and upload your files to start production.
          </p>
          <Link
            href="/templates"
            className="mt-6 inline-block rounded-sm border border-[#1B1B1B] bg-[#1B1B1B] px-6 py-3 text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#1B1B1B]/90"
          >
            Print My Template
          </Link>
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="mx-auto max-w-6xl space-y-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#1B1B1B' }}>
          What Creators Say
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, focus }) => (
            <div
              key={focus}
              className="rounded-lg border border-[#1B1B1B]/10 bg-white p-6 shadow-sm"
            >
              <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                &ldquo;{quote}&rdquo;
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider" style={{ color: '#C7A96B' }}>
                {focus}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section
        className="rounded-sm px-6 py-14 text-center md:px-8"
        style={{ backgroundColor: '#0F1720', color: '#F7F3EA' }}
      >
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-3xl font-semibold md:text-4xl" style={{ color: '#F7F3EA' }}>
            Ready to Print Your Tarot Deck?
          </h2>
          <p className="text-lg" style={{ color: 'rgba(247,243,234,0.9)' }}>
            Start with a prototype deck — no commitment, no minimums.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="#"
              className="rounded-sm border border-[#C7A96B] bg-[#C7A96B] px-6 py-3 text-sm font-medium text-[#0F1720] shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
            >
              Print Prototype Deck
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-[#F7F3EA]/80 bg-transparent px-6 py-3 text-sm font-medium transition-colors hover:bg-[#F7F3EA]/10"
              style={{ color: '#F7F3EA' }}
            >
              Talk to the Printing Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
