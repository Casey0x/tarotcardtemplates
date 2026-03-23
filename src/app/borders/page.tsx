import Image from 'next/image';
import Link from 'next/link';
import { BORDER_TEMPLATES } from '@/data/borders';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Border Templates | TarotCardTemplates.com',
  description:
    'Browse tarot card border templates for Canva and Photoshop. Choose from celestial, marble, steampunk, velvet, minimal, day of the dead, ocean/mermaid, dragon scale, Gothic romance, Art Nouveau lily, mystic candlelight wax ritual frames and more. All 70×120mm with 3mm bleed.',
};

export default function BordersPage() {
  /** Last item shown as a full-width “latest” card so it isn’t a single easy-to-miss tile on row 5. */
  const newestBorder = BORDER_TEMPLATES[BORDER_TEMPLATES.length - 1];
  const gridBorders = BORDER_TEMPLATES.slice(0, -1);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tarot Card Borders</h1>
      <p className="mt-3 text-charcoal/70">
        Choose a border style for your tarot deck — from minimalist line frames to richly gilded and marble designs.{' '}
        <span className="text-charcoal/60">({BORDER_TEMPLATES.length} templates)</span>
      </p>
      <p className="mt-4 rounded-sm border border-amber-400/40 bg-amber-50/90 px-4 py-3 text-sm text-charcoal">
        <span className="font-semibold text-charcoal">Latest border:</span>{' '}
        <Link
          href={`/borders/${newestBorder.slug}`}
          className="font-medium text-charcoal underline decoration-amber-600/60 underline-offset-2 hover:decoration-charcoal"
        >
          {newestBorder.name}
        </Link>
        <span className="text-charcoal/70">
          {' '}
          — shown below as the large card so it isn&apos;t hidden as a lone tile after four rows.
        </span>
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gridBorders.map((border) => (
          <Link
            key={border.slug}
            id={border.slug}
            href={`/borders/${border.slug}`}
            className="group flex flex-col scroll-mt-28 rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
          >
            <div className="relative mb-4 overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3 aspect-[3/5]">
              <Image
                src={border.image}
                alt={border.name}
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <h2 className="mb-1 text-sm font-semibold text-charcoal">{border.name}</h2>
            <p className="text-xs text-charcoal/80">{border.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 border-t border-charcoal/10 pt-10">
        <h2 className="text-lg font-semibold text-charcoal">Newest border style</h2>
        <p className="mt-1 text-sm text-charcoal/70">
          This template is listed separately so it isn’t easy to miss (it used to appear alone on a fifth row).
        </p>
        <Link
          id={newestBorder.slug}
          href={`/borders/${newestBorder.slug}`}
          className="mt-6 flex scroll-mt-28 flex-col gap-4 rounded-sm border-2 border-amber-400/50 bg-cream/90 p-4 shadow-md transition-all hover:border-amber-500 hover:shadow-lg sm:flex-row sm:items-stretch"
        >
          <div className="relative mx-auto aspect-[3/5] w-full max-w-[220px] shrink-0 overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3 sm:mx-0">
            <Image
              src={newestBorder.image}
              alt={newestBorder.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">Latest</p>
            <h3 className="mt-1 text-xl font-semibold text-charcoal">{newestBorder.name}</h3>
            <p className="mt-2 text-sm text-charcoal/80">{newestBorder.description}</p>
            <p className="mt-4 text-sm font-medium text-charcoal underline underline-offset-4">View template →</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
