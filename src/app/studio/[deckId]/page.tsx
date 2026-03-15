'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { TAROT_SECTIONS, getTarotDefault } from '@/lib/tarot-cards';

interface Deck {
  id: string;
  border_name: string;
  templated_template_id: string;
  total_cards: number;
  completed_cards: number;
}

interface CardRow {
  id: string;
  card_index: number;
  numeral: string | null;
  card_name: string | null;
  artwork_url: string | null;
  render_url: string | null;
  status: string;
}

function getCardLabel(card: CardRow): string {
  const d = getTarotDefault(card.card_index);
  const name = card.card_name ?? d?.name ?? `Card ${card.card_index + 1}`;
  const numeral = card.numeral ?? d?.numeral ?? '';
  return numeral ? `${numeral}  ${name}` : name;
}

export default function StudioDeckPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = params.deckId as string;
  const cardParam = searchParams.get('card');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const n = cardParam != null ? parseInt(cardParam, 10) : 0;
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  });
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [numeral, setNumeral] = useState('');
  const [cardName, setCardName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDeck = useCallback(async () => {
    const supabase = createClient();

    const { data: d, error: deckErr } = await supabase
      .from('decks')
      .select('id, border_name, templated_template_id, total_cards, completed_cards')
      .eq('id', deckId)
      .single();

    if (deckErr) {
      setLoadError(deckErr.message);
      setLoading(false);
      return;
    }
    if (!d) {
      setLoadError('Deck not found');
      setLoading(false);
      return;
    }

    setDeck(d as Deck);

    const { data: c, error: cardsErr } = await supabase
      .from('cards')
      .select('id, card_index, numeral, card_name, artwork_url, render_url, status')
      .eq('deck_id', deckId)
      .order('card_index');

    if (cardsErr) {
      setLoadError(cardsErr.message);
      setLoading(false);
      return;
    }

    setCards((c as CardRow[]) ?? []);
    setLoadError(null);
    setLoading(false);
  }, [deckId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    const n = cardParam != null ? parseInt(cardParam, 10) : NaN;
    if (Number.isFinite(n) && n >= 0) setCurrentIndex(n);
  }, [cardParam]);

  useEffect(() => {
    if (cards.length && currentIndex >= 0 && currentIndex < cards.length) {
      const c = cards[currentIndex];
      setArtworkUrl(c.artwork_url ?? null);
      setNumeral(c.numeral ?? '');
      setCardName(c.card_name ?? '');
    }
  }, [cards, currentIndex]);

  const currentCard = cards[currentIndex];
  const defaultCard = currentCard != null ? getTarotDefault(currentCard.card_index) : null;

  async function handleFile(file: File) {
    if (!currentCard || !deckId) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('deckId', deckId);
    form.append('cardId', currentCard.id);
    const res = await fetch('/api/studio/upload', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (data.url) setArtworkUrl(data.url);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  }

  const handleGenerate = useCallback(async () => {
    if (!currentCard || !deck || !artworkUrl) return;
    setGenerating(true);
    const res = await fetch('/api/studio/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deckId,
        cardId: currentCard.id,
        artworkUrl,
        cardName: cardName || undefined,
        numeral: numeral || undefined,
        templateId: deck.templated_template_id,
      }),
    });
    const data = await res.json();
    setGenerating(false);
    if (data.renderUrl) {
      await loadDeck();
    }
  }, [deckId, currentCard, deck, artworkUrl, cardName, numeral, loadDeck]);

  // Auto-render preview when artworkUrl, cardName, or numeral change (debounced 1s). No auto-render if no artwork.
  useEffect(() => {
    if (!artworkUrl) return;
    const timer = setTimeout(() => {
      handleGenerate();
    }, 1000);
    return () => clearTimeout(timer);
  }, [artworkUrl, cardName, numeral, handleGenerate]);

  async function goNext() {
    if (currentCard && (artworkUrl || numeral || cardName)) {
      await fetch('/api/studio/card', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          cardId: currentCard.id,
          artworkUrl: artworkUrl ?? undefined,
          numeral: numeral || undefined,
          cardName: cardName || undefined,
        }),
      });
    }
    if (currentIndex < cards.length - 1) setCurrentIndex((i) => i + 1);
    else router.push(`/studio/${deckId}/review`);
  }

  if (loading) {
    return (
      <div className="text-charcoal">
        <p className="text-center">Loading deck…</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-charcoal">
        <p className="text-center text-red-600">Error: {loadError}</p>
        <Link href="/studio" className="mt-4 block text-center text-charcoal/70 hover:text-charcoal">
          ← Back to Studio
        </Link>
      </div>
    );
  }
  if (!deck || !cards.length) {
    return (
      <div className="text-charcoal">
        <p className="text-center">Deck not found.</p>
        <Link href="/studio" className="mt-4 block text-center text-charcoal/70 hover:text-charcoal">
          ← Back to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-charcoal/10 bg-cream px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link href="/studio" className="text-charcoal/70 hover:text-charcoal">
            ← Studio
          </Link>
          <h1 className="text-xl font-semibold text-charcoal">{deck.border_name}</h1>
        </div>
      </div>

      <div className="bg-parchment">
        <div className="mx-auto flex max-w-6xl gap-6 p-6">
          {/* Left: card selector by tarot sections */}
          <aside className="w-56 shrink-0 overflow-y-auto rounded-sm border border-charcoal/10 bg-cardBg p-3 max-h-[calc(100vh-12rem)]">
            {TAROT_SECTIONS.map((section) => {
              const sectionCards = cards.filter(
                (c) => c.card_index >= section.startIndex && c.card_index < section.endIndex
              );
              if (sectionCards.length === 0) return null;
              return (
                <div key={section.title} className="mb-4">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/70">
                    {section.title}
                  </h2>
                  <ul className="space-y-0.5">
                    {sectionCards.map((c) => {
                      const i = cards.findIndex((x) => x.id === c.id);
                      const isActive = i === currentIndex;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setCurrentIndex(i)}
                            className={`w-full rounded-[2px] px-2 py-1.5 text-left text-sm transition ${
                              isActive
                                ? 'bg-charcoal text-cream'
                                : c.status === 'rendered'
                                  ? 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
                                  : 'text-charcoal/80 hover:bg-charcoal/10'
                            }`}
                          >
                            {getCardLabel(c)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </aside>

          {/* Center: card preview — Templated render or placeholder */}
          <div className="flex flex-1 items-start justify-center">
            <div className="relative aspect-[3/5] w-full max-w-sm rounded-sm border border-charcoal/10 bg-cardBg shadow-md transition-transform hover:scale-[1.01]">
              {currentCard?.render_url ? (
                <img
                  src={currentCard.render_url}
                  alt={currentCard.card_name || defaultCard?.name || `Card ${currentIndex + 1}`}
                  className="h-full w-full rounded-sm object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-sm p-6 text-center text-charcoal/60">
                  <p className="text-sm">
                    Click Generate Preview to render this card.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: upload + card name + numeral only */}
          <div className="w-80 shrink-0 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Artwork</h2>
              <div
                onDragOver={(e) => { e.preventDefault(); if (!generating) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { if (!generating) onDrop(e); }}
                className={`mt-2 rounded-sm border border-dashed p-6 text-center transition ${
                  dragOver ? 'border-charcoal/40 bg-charcoal/5' : 'border-charcoal/20 hover:border-charcoal/40'
                } ${generating ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="artwork-upload"
                  disabled={generating}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <label htmlFor="artwork-upload" className={generating ? 'cursor-not-allowed' : 'cursor-pointer text-charcoal/70 hover:text-charcoal'}>
                  {uploading ? 'Uploading…' : 'Drop image or click to upload'}
                </label>
                {artworkUrl && <p className="mt-2 text-sm text-charcoal/70">Image added.</p>}
              </div>
            </div>

            {generating && (
              <p className="text-sm text-charcoal/80">Generating preview...</p>
            )}

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Card name</h2>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={defaultCard?.name}
                disabled={generating}
                className="mt-2 w-full rounded-[2px] border border-charcoal/20 bg-cardBg px-3 py-2 text-charcoal placeholder:text-charcoal/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Numeral</h2>
              <input
                type="text"
                value={numeral}
                onChange={(e) => setNumeral(e.target.value)}
                placeholder={defaultCard?.numeral}
                disabled={generating}
                className="mt-2 w-full rounded-[2px] border border-charcoal/20 bg-cardBg px-3 py-2 text-charcoal placeholder:text-charcoal/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!artworkUrl || generating}
                className="rounded-[2px] border border-charcoal bg-charcoal px-6 py-2 text-cream transition hover:bg-charcoal/90 disabled:opacity-50"
              >
                {generating ? 'Rendering…' : 'Generate Preview'}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-[2px] border border-charcoal/80 bg-cream px-6 py-2 text-charcoal/80 transition hover:bg-charcoal/5"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
