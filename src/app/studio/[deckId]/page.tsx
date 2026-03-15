'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';

const MAJOR_ARCANA: { numeral: string; name: string }[] = [
  { numeral: '0', name: 'The Fool' },
  { numeral: 'I', name: 'The Magician' },
  { numeral: 'II', name: 'The High Priestess' },
  { numeral: 'III', name: 'The Empress' },
  { numeral: 'IV', name: 'The Emperor' },
  { numeral: 'V', name: 'The Hierophant' },
  { numeral: 'VI', name: 'The Lovers' },
  { numeral: 'VII', name: 'The Chariot' },
  { numeral: 'VIII', name: 'Strength' },
  { numeral: 'IX', name: 'The Hermit' },
  { numeral: 'X', name: 'Wheel of Fortune' },
  { numeral: 'XI', name: 'Justice' },
  { numeral: 'XII', name: 'The Hanged Man' },
  { numeral: 'XIII', name: 'Death' },
  { numeral: 'XIV', name: 'Temperance' },
  { numeral: 'XV', name: 'The Devil' },
  { numeral: 'XVI', name: 'The Tower' },
  { numeral: 'XVII', name: 'The Star' },
  { numeral: 'XVIII', name: 'The Moon' },
  { numeral: 'XIX', name: 'The Sun' },
  { numeral: 'XX', name: 'Judgement' },
  { numeral: 'XXI', name: 'The World' },
];

const NUMERALS_22 = MAJOR_ARCANA.map((a) => a.numeral);
const NUMERALS_78 = [...NUMERALS_22, ...Array.from({ length: 56 }, (_, i) => `${i + 22}`)];

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
  const numerals = deck?.total_cards === 22 ? NUMERALS_22 : NUMERALS_78;
  const suggestion = deck?.total_cards === 22 && currentIndex < MAJOR_ARCANA.length ? MAJOR_ARCANA[currentIndex] : null;

  async function handleFile(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
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

  async function handleGenerate() {
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
  }

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
      {/* Top bar: nav + title + progress pills — on page background */}
      <div className="border-b border-charcoal/10 bg-cream px-6 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-charcoal/70 hover:text-charcoal">
              ← Studio
            </Link>
            <h1 className="text-xl font-semibold text-charcoal">{deck.border_name}</h1>
          </div>
          <div className="flex flex-wrap gap-1">
            {cards.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-8 w-8 rounded-[2px] border text-xs transition ${
                  i === currentIndex
                    ? 'border-charcoal bg-charcoal text-cream'
                    : c.status === 'rendered'
                      ? 'border-charcoal/20 bg-charcoal text-cream'
                      : 'border-charcoal/10 bg-charcoal/10 text-charcoal/70'
                }`}
                title={`Card ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace area: slightly darker sand */}
      <div className="bg-parchment">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-2">
          {/* Left: card preview — near-white container */}
          <div className="flex items-center justify-center">
            <div className="relative aspect-[3/5] w-full max-w-sm rounded-sm border border-charcoal/10 bg-cardBg transition-transform hover:scale-[1.01]">
              {currentCard?.render_url ? (
                <Image
                  src={currentCard.render_url}
                  alt={currentCard.card_name || `Card ${currentIndex + 1}`}
                  fill
                  className="rounded-sm object-contain"
                  unoptimized
                />
              ) : artworkUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={artworkUrl}
                    alt="Preview"
                    fill
                    className="rounded-sm object-contain"
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-sm bg-charcoal/90 px-2 py-1 text-center text-sm text-cream">
                    {numeral} {cardName || 'Card name'}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-charcoal/50">
                  Upload artwork to preview
                </div>
              )}
            </div>
          </div>

          {/* Right: controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Step 1 — Artwork</h2>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-2 rounded-sm border border-dashed p-8 text-center transition ${
                  dragOver ? 'border-charcoal/40 bg-charcoal/5' : 'border-charcoal/20 hover:border-charcoal/40'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="artwork-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <label htmlFor="artwork-upload" className="cursor-pointer text-charcoal/70 hover:text-charcoal">
                  {uploading ? 'Uploading…' : 'Drop image here or click to upload'}
                </label>
                {artworkUrl && <p className="mt-2 text-sm text-charcoal/70">Image added.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Step 2 — Numeral</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {numerals.slice(0, 23).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumeral(n)}
                    className={`rounded-[2px] border px-2 py-1 text-sm transition ${
                      numeral === n
                        ? 'border-charcoal bg-charcoal text-cream'
                        : 'border-charcoal/20 bg-transparent text-charcoal hover:border-charcoal/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                {numerals.length > 23 && (
                  <span className="text-charcoal/60">+ more</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Step 3 — Card name</h2>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={suggestion?.name ?? 'e.g. The High Priestess'}
                className="mt-2 w-full rounded-[2px] border border-charcoal/20 bg-cardBg px-3 py-2 text-charcoal placeholder:text-charcoal/50"
              />
              {suggestion && (
                <button
                  type="button"
                  onClick={() => { setCardName(suggestion.name); setNumeral(suggestion.numeral); }}
                  className="mt-1 text-sm text-charcoal/70 underline hover:text-charcoal"
                >
                  Use: {suggestion.name}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!artworkUrl || generating}
                className="rounded-[2px] border border-charcoal bg-charcoal px-6 py-2 text-cream transition hover:bg-charcoal/90 disabled:opacity-50"
              >
                {generating ? 'Generating…' : 'Generate'}
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
