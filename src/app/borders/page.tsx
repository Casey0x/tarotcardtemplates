import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchBorders, FALLBACK_BORDER_IMAGE } from '@/data/borders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Tarot Card Border Templates | TarotCardTemplates.com',
  description:
    'Browse tarot card border templates for Canva and Photoshop. Choose from celestial, marble, steampunk, velvet, minimal, day of the dead, ocean/mermaid, dragon scale, Gothic romance, Art Nouveau lily, mystic candlelight, golden honeycomb apiary frames and more. All 70×120mm with 3mm bleed.',
  alternates: { canonical: '/borders' },
};

export default async function BordersPage() {
  const borders = await fetchBorders();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tarot Card Borders</h1>
      <p className="mt-3 text-charcoal/70">
        Choose a border style for your tarot deck — from minimalist line frames to richly gilded and marble designs.{' '}
        <span className="text-charcoal/60">({borders.length} templates)</span>
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {borders.length === 0 && (
          <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
            No borders are available right now.
          </p>
        )}
        {borders.map((border) => (
          <div
            key={border.slug}
            id={border.slug}
            className="group flex scroll-mt-28 flex-col rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
          >
            <Link href={`/borders/${border.slug}`} className="block">
              <div className="relative mb-4 aspect-[3/5] overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3">
                <Image
                  src={border.image ?? FALLBACK_BORDER_IMAGE}
                  alt={border.name}
                  fill
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <h2 className="mb-1 text-sm font-semibold text-charcoal">{border.name}</h2>
              <p className="text-xs text-charcoal/80">{border.description}</p>
              <p className="mt-3 text-sm font-medium text-charcoal">$9.95</p>
            </Link>
            <Link
              href={`/studio-beta?border=${border.slug}`}
              className="mt-3 text-xs font-medium text-charcoal underline underline-offset-2 hover:text-charcoal/80"
            >
              Try in Studio →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
