import Link from 'next/link';
import Image from 'next/image';
import { BORDER_STYLES } from '@/lib/borders';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Border Templates | TarotCardTemplates.com',
  description:
    'Browse tarot card border styles — celestial gilded, minimal line, vintage velvet, gothic cathedral and more. Download border templates for your tarot deck.',
};

export default function BordersIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-charcoal">Tarot Card Border Styles</h1>
        <p className="mt-4 max-w-2xl text-sm text-charcoal/70 leading-relaxed">
          Explore border design directions for your tarot deck — from minimalist line frames to
          richly gilded celestial and gothic borders. Click any border to view details and download.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BORDER_STYLES.map((style) => (
          <Link
            key={style.slug}
            href={`/borders/${style.slug}`}
            className="group flex flex-col rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
          >
            <div className="relative mb-4 overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3 aspect-[3/5]">
              <Image
                src={style.image}
                alt={style.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <h3 className="mb-1 text-sm font-semibold text-charcoal">{style.name}</h3>

            <p className="text-xs text-charcoal/80">{style.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
