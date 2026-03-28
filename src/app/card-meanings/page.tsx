import Link from 'next/link';
import { getAllCardMeanings } from '@/lib/card-meanings';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarot Card Meanings — All 78 Cards Explained | TarotCardTemplates.com',
  description:
    'Explore the meaning of all 78 tarot cards. Upright and reversed interpretations for love, career, health and more.',
  alternates: { canonical: '/card-meanings' },
};

// Converts an integer (1-22) to a Roman numeral string
function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
    [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'],
    [1,    'I'],
  ];
  let result = '';
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

// Index page only: Major Arcana → Roman numerals in the left column (no Arabic).
// The Fool (0) has no classical Roman numeral → leave column blank.
// Minor Arcana → no left-column number; the card name already carries rank (Ace, Eight, Page, etc.).
function formatIndexDisplayNumber(num: string | undefined | null, isMajor: boolean): string | null {
  if (!isMajor) return null;

  if (!num?.trim()) return null;
  const s = num.trim();
  const parsed = parseInt(s, 10);
  if (!isNaN(parsed)) {
    if (parsed <= 0) return null;
    if (parsed > 40) return null;
    return toRoman(parsed);
  }
  if (/^[IVXLCDM]+$/i.test(s)) return s.toUpperCase();
  return null;
}

export default async function CardMeaningsIndexPage() {
  const cards = await getAllCardMeanings();

  const majorArcanaRaw = cards.filter((c) => c.arcana === 'Major Arcana' || c.arcana === 'major');
  const majorArcana = majorArcanaRaw.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i
  );
  const minorArcana = cards.filter((c) => c.arcana !== 'Major Arcana' && c.arcana !== 'major');

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold text-charcoal">Tarot Card Meanings</h1>
        <p className="mt-4 text-charcoal/70 max-w-2xl mx-auto text-sm leading-relaxed">
          Explore the meaning of all 78 tarot cards in the traditional tarot deck.
          This page provides a full list of 78 tarot cards and meanings, including
          the Major Arcana and Minor Arcana — Cups, Pentacles, Swords, and Wands.
          Each tarot card meaning page explains the symbolism, upright interpretation,
          and role of the card in tarot readings. Click any card below to explore its
          full meaning.
        </p>
      </div>

      {/* Major Arcana */}
      {majorArcana.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[#C7A96B] text-sm" aria-hidden="true">&#10022;&#8212;&#8212;&#10022;</span>
            <h2 className="text-lg font-semibold tracking-widest uppercase text-charcoal">Major Arcana</h2>
            <span className="text-[#C7A96B] text-sm" aria-hidden="true">&#10022;&#8212;&#8212;&#10022;</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-charcoal/10">
            {majorArcana.map((card) => (
              <CardRow
                key={card.slug}
                card={card}
                displayNumber={formatIndexDisplayNumber(card.number, true)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Minor Arcana */}
      {minorArcana.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[#C7A96B] text-sm" aria-hidden="true">&#10022;&#8212;&#8212;&#10022;</span>
            <h2 className="text-lg font-semibold tracking-widest uppercase text-charcoal">Minor Arcana</h2>
            <span className="text-[#C7A96B] text-sm" aria-hidden="true">&#10022;&#8212;&#8212;&#10022;</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-charcoal/10">
            {minorArcana.map((card) => (
              <CardRow
                key={card.slug}
                card={card}
                displayNumber={formatIndexDisplayNumber(card.number, false)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Explore Tarot Deck Templates */}
      <section className="mt-14 pt-10 border-t border-charcoal/10">
        <h2 className="text-lg font-semibold tracking-widest uppercase text-charcoal mb-4">
          Explore Tarot Deck Templates
        </h2>
        <p className="text-charcoal/70 text-sm leading-relaxed mb-6 max-w-2xl">
          See how tarot cards appear across different tarot deck design styles.
          These templates demonstrate how creators can build unique tarot decks
          while maintaining the structure of the traditional tarot system.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <Link href="/templates/Bloodbound-Tarot" className="text-charcoal underline underline-offset-4 hover:text-[#C7A96B] transition-colors">
              Bloodbound Tarot
            </Link>
          </li>
          <li>
            <Link href="/templates/Psychedelic-70s-Tarot" className="text-charcoal underline underline-offset-4 hover:text-[#C7A96B] transition-colors">
              Psychedelic 70s Tarot
            </Link>
          </li>
          <li>
            <Link href="/templates/Cosmic-Void" className="text-charcoal underline underline-offset-4 hover:text-[#C7A96B] transition-colors">
              Cosmic Void
            </Link>
          </li>
          <li>
            <Link href="/templates/Astral-Dominion" className="text-charcoal underline underline-offset-4 hover:text-[#C7A96B] transition-colors">
              Astral Dominion
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

function CardRow({
  card,
  displayNumber,
}: {
  card: { slug: string; name: string };
  displayNumber: string | null;
}) {
  return (
    <Link
      href={'/card-meanings/' + card.slug}
      className="group flex items-center gap-4 px-5 py-4 border-b border-r border-charcoal/10 hover:bg-[#C7A96B]/5 transition-colors duration-150"
    >
      {displayNumber ? (
        <span className="w-10 shrink-0 text-right text-xs font-medium text-[#C7A96B] tracking-wider">
          {displayNumber}
        </span>
      ) : (
        <span className="w-10 shrink-0" />
      )}
      <span className="text-sm text-charcoal group-hover:text-[#C7A96B] transition-colors duration-150 leading-snug">
        {card.name}
      </span>
      <span className="ml-auto text-charcoal/20 group-hover:text-[#C7A96B]/60 transition-colors duration-150 text-xs">
        &#8594;
      </span>
    </Link>
  );
}
