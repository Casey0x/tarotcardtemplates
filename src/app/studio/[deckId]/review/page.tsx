'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface Deck {
  id: string;
  border_name: string;
  total_cards: number;
  completed_cards: number;
}

interface CardRow {
  id: string;
  card_index: number;
  card_name: string | null;
  render_url: string | null;
  status: string;
}

export default function StudioReviewPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardRow[]>([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: d } = await supabase.from('decks').select('id, border_name, total_cards, completed_cards').eq('id', deckId).single();
    setDeck(d as Deck ?? null);
    const { data: c } = await supabase.from('cards').select('id, card_index, card_name, render_url, status').eq('deck_id', deckId).order('card_index');
    setCards((c as CardRow[]) ?? []);
  }, [deckId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!deck) {
    return (
      <div className="text-charcoal">
        <p className="text-center">Loading…</p>
      </div>
    );
  }

  const rendered = cards.filter((c) => c.status === 'rendered' && c.render_url);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={`/studio/${deckId}`} className="text-charcoal/70 hover:text-charcoal">
            ← Back to designer
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-charcoal">{deck.border_name} — Review</h1>
          <p className="mt-1 text-charcoal/70">{rendered.length} of {deck.total_cards} cards rendered</p>
        </div>
        <Link
          href={`/studio/${deckId}/download`}
          className="rounded-[2px] border border-charcoal bg-charcoal px-6 py-2 text-cream transition hover:bg-charcoal/90"
        >
          Download Deck
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-sm border border-charcoal/10 bg-cardBg">
            {c.render_url ? (
              <Link href={`/studio/${deckId}?card=${c.card_index}`} className="block">
                <div className="relative aspect-[3/5] w-full">
                  <Image
                    src={c.render_url}
                    alt={c.card_name || `Card ${c.card_index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 20vw"
                    unoptimized
                  />
                </div>
                <p className="truncate p-2 text-center text-xs text-charcoal/70">
                  {c.card_name || `#${c.card_index + 1}`}
                </p>
              </Link>
            ) : (
              <Link
                href={`/studio/${deckId}`}
                className="flex aspect-[3/5] items-center justify-center p-4 text-center text-sm text-charcoal/50 hover:text-charcoal/70"
              >
                Card {c.card_index + 1} — not rendered
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
