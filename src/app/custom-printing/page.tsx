import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Custom Tarot Deck Printing | Professional Print Services | TarotCardTemplates.com',
  description:
    'Print your tarot deck professionally. Premium card stock, prototype decks, custom packaging, worldwide shipping. Built for creators and artists.',
};

const ACCENT = '#C7A96B';
const PAGE_BG = '#1a1814';
const BODY = '#d4cfc7';
const HEADING = '#f0ece4';
const CARD_BG = '#272320';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const CARD_BODY = '#b8b0a6';
const SPEC_PANEL = '#201e1b';
const DIVIDER = 'rgba(255,255,255,0.1)';
const BTN_DARK_TEXT = '#1a1814';

const HERO_TRUST = [
  { icon: '🖨', label: '300gsm & 350gsm card stock' },
  { icon: '📦', label: 'Tuck box & rigid box options' },
  { icon: '✈', label: 'Ships worldwide' },
  { icon: '⭐', label: '500+ decks printed' },
];

const FEATURES = [
  {
    icon: '🎨',
    title: 'Colour-Matched Output',
    body: 'Calibrated printing so what you see on screen is what arrives in the box.',
  },
  {
    icon: '📐',
    title: 'Template-Ready Formatting',
    body: 'Our tarot templates are already sized and bled correctly. Export and upload — no guesswork.',
  },
  {
    icon: '🔍',
    title: 'Digital Proof Before Print',
    body: 'Every order receives a digital proof for approval before production begins.',
  },
  {
    icon: '🌍',
    title: 'Worldwide Shipping',
    body: 'Orders ship to 40+ countries with tracking included.',
  },
  {
    icon: '⚡',
    title: 'Fast Turnaround',
    body: 'Prototype decks ship in 5–7 days. Small batch in 10–14 days.',
  },
  {
    icon: '🗂',
    title: 'Flexible Quantities',
    body: 'No minimums on prototypes. Small runs start at 25 decks.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Choose a Template',
    body:
      'Browse our print-ready border templates or upload your own artwork. All templates export at the correct resolution.',
  },
  {
    step: 2,
    title: 'Prepare Your Files',
    body:
      "Export at 300 DPI with 3mm bleed. Our templates handle this automatically — just export and you're done.",
  },
  {
    step: 3,
    title: 'Upload & Approve',
    body:
      'We review your files for print issues and send a digital proof. You approve before anything goes to press.',
  },
  {
    step: 4,
    title: 'Print & Ship',
    body:
      'Your deck is printed, quality-checked, and shipped worldwide with tracking. Prototype decks arrive in 5–7 days.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The print quality exceeded my expectations. Colours matched my files exactly and the card stock feels premium.',
    attribution: 'Sarah M., Independent Tarot Artist',
  },
  {
    quote:
      'Colour accuracy was spot-on. What I saw on screen is what I got in hand — no surprises.',
    attribution: 'James R., Kickstarter Creator',
  },
  {
    quote:
      'From approval to delivery was under two weeks. Perfect for my Kickstarter fulfilment.',
    attribution: 'Luna K., Oracle Deck Publisher',
  },
];

const PRINT_SPECS: { label: string; value: string }[] = [
  { label: 'Card Size', value: '70 × 120 mm (standard tarot)' },
  { label: 'Export Size', value: '898 × 1488 px at 300 DPI' },
  { label: 'Bleed', value: '3mm on all sides' },
  { label: 'Card Stock', value: '300gsm smooth · 350gsm black core' },
  { label: 'Finishes', value: 'Matte · Gloss · Linen' },
  { label: 'Corners', value: 'Rounded (standard tarot)' },
  { label: 'Packaging', value: 'Tuck box · Rigid collector box' },
  { label: 'Add-ons', value: 'Foil stamping · Spot UV · Shrink wrap' },
  {
    label: 'Minimum Quantity',
    value: '1 deck (prototype) · 25 decks (batch)',
  },
  {
    label: 'Turnaround',
    value: '5–7 days (prototype) · 10–14 days (batch) · 3–4 weeks (production)',
  },
];

const heroMaskStyle = {
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 35%)',
  maskImage: 'linear-gradient(to right, transparent, black 35%)',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
} as const;

export default function CustomPrintingPage() {
  return (
    <div
      className="-mx-6 -my-12 space-y-0 rounded-sm font-sans"
      style={{ backgroundColor: PAGE_BG, color: BODY }}
    >
      {/* SECTION 1 — Hero */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10">
          <div className="space-y-6 text-center lg:text-left">
            <p
              className="font-serif text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              Professional printing
            </p>
            <h1
              className="font-serif max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl"
              style={{ color: HEADING }}
            >
              Your Tarot Deck. Printed to Last.
            </h1>
            <p className="text-lg leading-relaxed md:max-w-xl md:text-xl">
              From a single prototype to a full production run — premium card stock, worldwide
              shipping, and print quality that matches your vision.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <Link
                href="#"
                className="rounded-sm px-6 py-3 text-sm font-medium shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  backgroundColor: ACCENT,
                  color: BTN_DARK_TEXT,
                  border: `1px solid ${ACCENT}`,
                }}
              >
                Print a Prototype — from $49
              </Link>
              <Link
                href="#"
                className="rounded-sm border bg-transparent px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: HEADING, color: HEADING }}
              >
                Get a Production Quote
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-4 lg:justify-start">
              {HERO_TRUST.map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex max-w-[11rem] flex-col items-center gap-1.5 text-center text-sm sm:max-w-none sm:flex-row sm:gap-2 sm:text-left"
                  style={{ color: CARD_BODY }}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {icon}
                  </span>
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative hidden min-h-[320px] w-full lg:block lg:min-h-[380px]"
            aria-hidden
          >
            <div className="absolute inset-0 overflow-hidden rounded-sm" style={heroMaskStyle}>
              <Image
                src="/images/printing-hero.jpg"
                alt=""
                fill
                className="object-cover object-right"
                sizes="(min-width: 1024px) 45vw, 0vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Pricing */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2
            className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]"
            style={{ color: HEADING }}
          >
            Choose Your Print Run
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div
              className="flex flex-col rounded-lg border p-6"
              style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
            >
              <h3 className="font-serif text-lg font-semibold" style={{ color: HEADING }}>
                Prototype
              </h3>
              <p className="mt-3 text-base" style={{ color: ACCENT }}>
                <span className="font-semibold">$49 per deck</span>
                <span style={{ color: CARD_BODY }}> · 1 deck</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: CARD_BODY }}>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  78-card full deck
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  300gsm smooth stock
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Rounded corners
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Tuck box included
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Ships in 5–7 days
                </li>
              </ul>
              <Link
                href="#"
                className="mt-8 block w-full rounded-sm py-3 text-center text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: BTN_DARK_TEXT }}
              >
                Order Prototype
              </Link>
            </div>

            <div
              className="flex flex-col rounded-lg border p-6"
              style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
            >
              <h3 className="font-serif text-lg font-semibold" style={{ color: HEADING }}>
                Small Batch
              </h3>
              <p className="mt-3 text-base" style={{ color: ACCENT }}>
                <span className="font-semibold">$6.50 per deck</span>
                <span style={{ color: CARD_BODY }}> · 25–200 decks</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: CARD_BODY }}>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  25–200 deck runs
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  300gsm or 350gsm black core
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Matte, gloss, or linen finish
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Tuck or rigid box
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Ships in 10–14 days
                </li>
              </ul>
              <Link
                href="#"
                className="mt-8 block w-full rounded-sm border bg-transparent py-3 text-center text-sm font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: HEADING, color: HEADING }}
              >
                Get a Quote
              </Link>
            </div>

            <div
              className="flex flex-col rounded-lg border p-6"
              style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
            >
              <h3 className="font-serif text-lg font-semibold" style={{ color: HEADING }}>
                Full Production
              </h3>
              <p className="mt-3 text-base" style={{ color: ACCENT }}>
                <span className="font-semibold">$3.20 per deck</span>
                <span style={{ color: CARD_BODY }}> · 500+ decks</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: CARD_BODY }}>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Premium stock and finishes
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Foil stamping available
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Spot UV available
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Rigid collector box option
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Ships in 3–4 weeks
                </li>
              </ul>
              <Link
                href="#"
                className="mt-8 block w-full rounded-sm py-3 text-center text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: BTN_DARK_TEXT }}
              >
                Start Production
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Features */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2
            className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]"
            style={{ color: HEADING }}
          >
            Print Quality You Can Feel
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12">
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="space-y-3">
                <span className="text-2xl leading-none" aria-hidden>
                  {icon}
                </span>
                <h3 className="font-serif text-lg font-semibold" style={{ color: HEADING }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Print specifications */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2
            className="font-serif mb-8 text-3xl font-semibold tracking-tight md:text-[2rem]"
            style={{ color: HEADING }}
          >
            Print Specifications
          </h2>
          <div
            className="rounded-lg border px-6 py-8 md:px-10 md:py-10"
            style={{ backgroundColor: SPEC_PANEL, borderColor: CARD_BORDER }}
          >
            <dl className="divide-y divide-white/10">
              {PRINT_SPECS.map(({ label, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-1 gap-1 py-4 first:pt-0 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] sm:gap-x-10 sm:gap-y-0"
                >
                  <dt className="text-sm font-semibold" style={{ color: HEADING }}>
                    {label}
                  </dt>
                  <dd className="text-sm" style={{ color: CARD_BODY }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* SECTION 5 — How it works */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <h2
            className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]"
            style={{ color: HEADING }}
          >
            How It Works
          </h2>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {HOW_IT_WORKS_STEPS.map(({ step, title, body }) => (
              <div key={step} className="relative pt-2">
                <div
                  className="pointer-events-none absolute -left-1 -top-4 select-none font-serif text-[4.5rem] font-semibold leading-none text-[#C7A96B]/20 sm:text-[5rem]"
                  aria-hidden
                >
                  {step}
                </div>
                <h3 className="relative font-serif text-lg font-semibold" style={{ color: HEADING }}>
                  {title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template integration — preserved link */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div
            className="rounded-lg border p-8 md:p-10"
            style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
          >
            <h2
              className="font-serif text-2xl font-semibold tracking-tight md:text-[1.75rem]"
              style={{ color: HEADING }}
            >
              Already Using One of Our Tarot Templates?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: CARD_BODY }}>
              Our tarot templates are already formatted for professional printing. Simply export your
              artwork and upload your files to start production.
            </p>
            <Link
              href="/templates"
              className="mt-8 inline-block rounded-sm px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: BTN_DARK_TEXT }}
            >
              Print My Template
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Testimonials */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2
            className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]"
            style={{ color: HEADING }}
          >
            What Creators Say
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, attribution }) => (
              <figure
                key={attribution}
                className="relative rounded-lg border p-6 pt-10"
                style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
              >
                <span
                  className="absolute left-5 top-5 font-serif text-5xl leading-none text-[#C7A96B]/60"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <blockquote
                  className="relative pl-1 text-sm leading-relaxed"
                  style={{ color: CARD_BODY }}
                >
                  {quote}
                </blockquote>
                <figcaption
                  className="relative mt-5 border-t pt-4 text-sm"
                  style={{ borderColor: DIVIDER, color: HEADING }}
                >
                  — {attribution}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Final CTA */}
      <section
        className="border-t px-6 py-20 text-center md:px-8"
        style={{
          backgroundColor: CARD_BG,
          borderColor: DIVIDER,
        }}
      >
        <div className="mx-auto max-w-2xl space-y-5">
          <h2
            className="font-serif text-3xl font-semibold leading-tight md:text-4xl"
            style={{ color: HEADING }}
          >
            Ready to Hold Your Deck in Your Hands?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: CARD_BODY }}>
            Start with one prototype deck. No commitment, no minimums. Ships in 5–7 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="#"
              className="rounded-sm px-6 py-3 text-sm font-medium shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                backgroundColor: ACCENT,
                color: BTN_DARK_TEXT,
                border: `1px solid ${ACCENT}`,
              }}
            >
              Order a Prototype — $49
            </Link>
            <Link
              href="#"
              className="rounded-sm border bg-transparent px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ borderColor: HEADING, color: HEADING }}
            >
              Talk to the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
