import Link from 'next/link';
import { getAllCardMeanings } from '@/lib/card-meanings';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Meanings — Upright, Reversed & More | TarotCardTemplates.com',
  description: 'Explore the symbolic meanings behind classic tarot cards. Upright and reversed interpretations, love, career, health and more.',
  alternates: { canonical: '/tarot-card-meanings' },
};

export default async function TarotCardMeaningsPage() {
  const cards = await getAllCardMeanings();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold text-charcoal">Tarot Card Meanings</h1>
        <p className="mt-4 text-charcoal/70 max-w-xl mx-auto">
          Explore upright and reversed meanings, love, career, health interpretations and more
          for each card in the deck.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={"/card-meanings/" + card.slug}
            className="group flex flex-col items-center gap-2"
          >
            {card.featuredImageUrl && (
              <div className="relative" style={{ width: '105px' }}>
                <img
                  src={card.featuredImageUrl}
                  alt={card.name + " tarot card"}
                  width={105}
                  height={175}
                  className="rounded-md object-cover transition-transform duration-200 group-hover:-translate-y-1"
                  style={{ width: '105px', height: '175px' }}
                />
                <div
                  className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ border: '2px solid #C7A96B', borderRadius: '7px' }}
                />
              </div>
            )}
            <span className="text-xs text-charcoal/70 text-center leading-tight">
              {card.name} Tarot Meaning
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
