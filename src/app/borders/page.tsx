import Image from 'next/image';
import Link from 'next/link';
import { BORDER_TEMPLATES } from '@/data/borders';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Border Templates | TarotCardTemplates.com',
  description:
    'Browse tarot card border templates for Canva and Photoshop. Choose from celestial, marble, steampunk, velvet and minimal styles. All 70×120mm with 3mm bleed.',
};

export default function BordersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tarot Card Borders</h1>
      <p className="mt-3 text-charcoal/70">
        Choose a border style for your tarot deck — from minimalist line frames to richly gilded and marble designs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BORDER_TEMPLATES.map((border) => (
          <Link
            key={border.slug}
            href={`/borders/${border.slug}`}
            className="group flex flex-col rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
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
    </div>
  );
}
