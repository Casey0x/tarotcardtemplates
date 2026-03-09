import Link from 'next/link';
import { getAllCardMeanings } from '@/lib/card-meanings';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Meanings — All 78 Cards Explained | TarotCardTemplates.com',
  description:
    'Explore the meaning of all 78 tarot cards. Upright and reversed interpretations for love, career, health and more.',
};

export default async function CardMeaningsIndexPage() {
  const cards = await getAllCardMeanings();

  const majorArcana = cards.filter((c) => c.arcana === 'Major Arcana' || c.arcana === 'major');
  const minorArcana = cards.filter((c) => c.arcana !== 'Major Arcana' && c.arcana !== 'major');

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold text-charcoal">Tarot Card Meanings</h1>
        <p className="mt-4 text-charcoal/70 max-w-2xl mx-auto text-sm leading-relaxed">
          Explore upright and reversed meanings, love, career, health interpretations and more
          for each card in the deck. Click any card to read its full meaning.
        </p>
      </div>

      {/* Major Arcana */}
      {majorArcana.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[#C7A96B] text-sm">✦——✦</span>
            <h2 className="text-xl font-semibold tracking-wide text-charcoal">Major Arcana</h2>
            <span className="text-[#C7A96B] text-sm">✦——✦</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {majorArcana.map((card) => (
              <CardTile key={card.slug} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* Minor Arcana */}
      {minorArcana.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[#C7A96B] text-sm">✦——✦</span>
            <h2 className="text-xl font-semibold tracking-wide text-charcoal">Minor Arcana</h2>
            <span className="text-[#C7A96B] text-sm">✦——✦</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {minorArcana.map((card) => (
              <CardTile key={card.slug} card={card} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function CardTile({ card }: { card: { slug: string; name: string; number?: string; featuredImageUrl?: string } }) {
  return (
    <Link
      href={"/card-meanings/" + card.slug}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div className="relative w-full" style={{ aspectRatio: '3/5' }}>
        {card.featuredImageUrl ? (
          <img
            src={card.featuredImageUrl}
            alt={card.name + " tarot card"}
            className="w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:-translate-y-1"
          />
        ) : (
          <div className="w-full h-full rounded-md bg-charcoal/10 flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-1">
            <span className="text-charcoal/30 text-xs text-center px-1">{card.name}</span>
          </div>
        )}
        <div
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ border: '2px solid #C7A96B', borderRadius: '7px' }}
        />
      </div>
      {card.number && (
        <span className="text-[10px] text-charcoal/40 uppercase tracking-widest">{card.number}</span>
      )}
      <span className="text-xs text-charcoal/70 leading-tight">{card.name}</span>
    </Link>
  );
}
