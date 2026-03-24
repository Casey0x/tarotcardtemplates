import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BORDER_TEMPLATES } from '@/data/borders';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Custom Tarot Deck Printing | Professional Print Services | TarotCardTemplates.com',
  description:
    'Print your tarot deck professionally. Premium card stock, prototype decks, custom packaging, worldwide shipping. Built for creators and artists.',
};

const ACCENT = '#C7A96B';
const PAGE_BG = '#f0ece4';
const SPEC_PANEL = '#e8e0d4';
const MUTED = '#555555';

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
      'Export at 300 DPI with 3mm bleed. Our templates handle this automatically — just export and you\'re done.',
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
    name: 'Sarah M.',
    role: 'Independent Tarot Artist',
  },
  {
    quote:
      'Colour accuracy was spot-on. What I saw on screen is what I got in hand — no surprises.',
    name: 'James R.',
    role: 'Kickstarter Creator',
  },
  {
    quote:
      'From approval to delivery was under two weeks. Perfect for my Kickstarter fulfilment.',
    name: 'Luna K.',
    role: 'Oracle Deck Publisher',
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

/** Subtle repeating tarot-frame motif for final CTA background */
const TAROT_PATTERN_DATA_URL =
  'url("data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none"><path stroke="rgba(255,255,255,0.06)" stroke-width="0.6" d="M8 12h64v56H8z"/><path stroke="rgba(255,255,255,0.04)" stroke-width="0.5" d="M14 18h52v44H14zM22 26h36v28H22z"/></svg>`,
  ) +
  '")';

export default function CustomPrintingPage() {
  const heroCardImages = [
    BORDER_TEMPLATES[0]?.image,
    BORDER_TEMPLATES[Math.min(4, BORDER_TEMPLATES.length - 1)]?.image,
    BORDER_TEMPLATES[Math.min(8, BORDER_TEMPLATES.length - 1)]?.image,
  ].filter(Boolean) as string[];

  return (
    <div
      className="-mx-6 space-y-0 rounded-sm text-charcoal"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* 1 — Hero */}
      <section className="relative overflow-hidden px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16">
          <div className="space-y-6 text-center lg:text-left">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              Professional printing
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl">
              Your Tarot Deck. Printed to Last.
            </h1>
            <p className="text-xl font-normal leading-relaxed text-charcoal/85 md:max-w-xl md:text-[1.35rem]">
              From a single prototype to a full production run — premium card stock, worldwide
              shipping, and print quality that matches your vision.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <Link
                href="#"
                className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream shadow-[0_14px_35px_rgba(27,27,27,0.28)] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-charcoal/90"
              >
                Print a Prototype — from $49
              </Link>
              <Link
                href="#"
                className="rounded-sm border border-charcoal/80 bg-transparent px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-[#C7A96B] hover:bg-white/60"
              >
                Get a Production Quote
              </Link>
            </div>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-4 lg:justify-start">
              {HERO_TRUST.map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex max-w-[11rem] flex-col items-center gap-1.5 text-center text-sm sm:max-w-none sm:flex-row sm:gap-2 sm:text-left"
                  style={{ color: MUTED }}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {icon}
                  </span>
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {heroCardImages.length > 0 ? (
            <div className="relative mx-auto hidden h-[min(28rem,70vw)] w-full max-w-md lg:block">
              <div
                className="pointer-events-none absolute inset-x-8 top-8 h-48 rounded-full bg-gradient-to-b from-amber-200/25 via-transparent to-transparent blur-3xl"
                aria-hidden
              />
              <div
                className="absolute left-0 top-10 aspect-[3/5] w-[42%] overflow-hidden rounded-xs border border-charcoal/15 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]"
                style={{ transform: 'rotate(-7deg)' }}
              >
                <Image
                  src={heroCardImages[0]}
                  alt=""
                  width={200}
                  height={333}
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="absolute left-[28%] top-4 z-[1] aspect-[3/5] w-[48%] overflow-hidden rounded-xs border border-charcoal/15 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.28)]"
              >
                <Image
                  src={heroCardImages[1] ?? heroCardImages[0]}
                  alt=""
                  width={240}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="absolute right-0 top-16 aspect-[3/5] w-[42%] overflow-hidden rounded-xs border border-charcoal/15 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.2)]"
                style={{ transform: 'rotate(8deg)' }}
              >
                <Image
                  src={heroCardImages[2] ?? heroCardImages[0]}
                  alt=""
                  width={200}
                  height={333}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 2 — Print run / pricing */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal md:text-[2rem]">
            Choose Your Print Run
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-charcoal">Prototype</h3>
              <p className="mt-2 text-xl font-semibold" style={{ color: ACCENT }}>
                $49{' '}
                <span className="text-base font-normal" style={{ color: MUTED }}>
                  / deck
                </span>
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                1 deck
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: MUTED }}>
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
                className="mt-8 block w-full rounded-sm border border-charcoal bg-charcoal py-3 text-center text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
              >
                Order Prototype
              </Link>
            </div>

            <div className="flex flex-col rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-charcoal">Small Batch</h3>
              <p className="mt-2 text-xl font-semibold" style={{ color: ACCENT }}>
                $6.50{' '}
                <span className="text-base font-normal" style={{ color: MUTED }}>
                  / deck
                </span>
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                25–200 decks
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: MUTED }}>
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
                  Choice of 300gsm or 350gsm black core
                </li>
                <li className="flex gap-2">
                  <span style={{ color: ACCENT }} aria-hidden>
                    •
                  </span>
                  Matte / gloss / linen finish
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
                className="mt-8 block w-full rounded-sm border border-charcoal py-3 text-center text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5"
              >
                Get a Quote
              </Link>
            </div>

            <div className="flex flex-col rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-charcoal">Full Production</h3>
              <p className="mt-2 text-xl font-semibold" style={{ color: ACCENT }}>
                $3.20{' '}
                <span className="text-base font-normal" style={{ color: MUTED }}>
                  / deck
                </span>
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                500+ decks
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: MUTED }}>
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
                className="mt-8 block w-full rounded-sm border border-charcoal bg-charcoal py-3 text-center text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
              >
                Start Production
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — What makes us different */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal md:text-[2rem]">
            Print Quality You Can Feel
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12">
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="space-y-3">
                <span className="text-2xl leading-none" aria-hidden>
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
                <p className="text-sm leading-relaxed text-charcoal/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Print specifications */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight text-charcoal md:text-[2rem]">
            Print Specifications
          </h2>
          <div
            className="rounded-lg border border-charcoal/10 px-6 py-8 shadow-sm md:px-10 md:py-10"
            style={{ backgroundColor: SPEC_PANEL }}
          >
            <dl className="divide-y divide-charcoal/15">
              {PRINT_SPECS.map(({ label, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-1 gap-1 py-4 first:pt-0 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] sm:gap-x-10 sm:gap-y-0"
                >
                  <dt className="text-sm font-semibold text-charcoal">{label}</dt>
                  <dd className="text-sm text-charcoal/80">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 5 — How it works */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal md:text-[2rem]">
            How It Works
          </h2>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {HOW_IT_WORKS_STEPS.map(({ step, title, body }) => (
              <div key={step} className="relative pt-2">
                <div
                  className="pointer-events-none absolute -left-1 -top-4 select-none text-[4.5rem] font-semibold leading-none text-[#C7A96B]/[0.18] sm:text-[5rem]"
                  aria-hidden
                >
                  {step}
                </div>
                <h3 className="relative text-lg font-semibold text-charcoal">{title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-charcoal/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template integration */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-charcoal/10 bg-white p-8 shadow-sm md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal md:text-[1.75rem]">
              Already Using One of Our Tarot Templates?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/80">
              Our tarot templates are already formatted for professional printing. Simply export your
              artwork and upload your files to start production.
            </p>
            <Link
              href="/templates"
              className="mt-8 inline-block rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
            >
              Print My Template
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — Testimonials */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal md:text-[2rem]">
            What Creators Say
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <figure
                key={name}
                className="quote-card relative rounded-lg border border-charcoal/10 bg-white p-6 pt-8 shadow-sm"
              >
                <blockquote className="relative text-sm leading-relaxed text-charcoal/80">
                  <span
                    className="absolute -left-0 -top-1 font-serif text-5xl leading-none text-[#C7A96B]/40"
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <span className="relative z-[1] pl-5">{quote}</span>
                </blockquote>
                <figcaption className="mt-6 border-t border-charcoal/10 pt-4 text-sm">
                  <span className="font-semibold text-charcoal">{name}</span>
                  <span className="mt-1 block text-xs text-charcoal/65">{role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Final CTA */}
      <section
        className="relative overflow-hidden rounded-sm px-6 py-16 text-center md:px-8 md:py-20"
        style={{
          backgroundColor: '#0f1720',
          color: '#f4f1ea',
          backgroundImage: `${TAROT_PATTERN_DATA_URL}, linear-gradient(180deg, #0f1720 0%, #0b1218 100%)`,
          backgroundSize: '80px 80px, 100% 100%',
        }}
      >
        <div className="relative z-[1] mx-auto max-w-2xl space-y-5">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl" style={{ color: '#f4f1ea' }}>
            Ready to Hold Your Deck in Your Hands?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(244,241,234,0.92)' }}>
            Start with one prototype deck. No commitment, no minimums. Ships in 5–7 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="#"
              className="rounded-sm border px-6 py-3 text-sm font-medium shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: ACCENT,
                backgroundColor: ACCENT,
                color: '#1f1f1d',
              }}
            >
              Order a Prototype — $49
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-cream/85 bg-transparent px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-white/10"
            >
              Talk to the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
