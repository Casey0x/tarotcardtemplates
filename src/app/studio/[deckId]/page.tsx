'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { TAROT_CARDS_78, TAROT_SECTIONS, type TarotCardDefault } from '@/lib/tarot-cards';

type Deck = {
  id: string;
  border_name: string;
  templated_template_id: string;
};

type CardRow = {
  id: string;
  deck_id: string;
  card_index: number;
  render_url: string | null;
  status: string;
};

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

function suitFromIndex(cardIndex: number): string {
  if (cardIndex < 22) return 'Major';
  if (cardIndex < 36) return 'Wands';
  if (cardIndex < 50) return 'Cups';
  if (cardIndex < 64) return 'Swords';
  return 'Pentacles';
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream ${className}`}
    />
  );
}

async function validateImageFile(file: File): Promise<{ warning: string | null; error: string | null }> {
  if (!file.type.startsWith('image/')) {
    return { warning: null, error: 'Please upload an image file' };
  }

  if (file.size > MAX_FILE_BYTES) {
    return { warning: null, error: 'File too large. Max 25MB' };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = objectUrl;
    });

    const warning =
      dims.width < 400 || dims.height < 570
        ? 'Image may appear blurry. Recommended minimum 600x860px'
        : null;

    return { warning, error: null };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function StudioDeckPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const searchParams = useSearchParams();

  const cardParam = searchParams.get('card');
  const initialSelectedIndexFromQuery = useMemo(() => {
    if (cardParam == null) return null;
    const n = parseInt(cardParam, 10);
    if (!Number.isFinite(n) || n < 0 || n >= 78) return null;
    return n;
  }, [cardParam]);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [renderSuccess, setRenderSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cardsByIndex = useMemo(() => {
    const map = new Map<number, CardRow>();
    for (const c of cards) map.set(c.card_index, c);
    return map;
  }, [cards]);

  const cardsComplete = useMemo(() => cards.filter((c) => c.status === 'rendered').length, [cards]);
  const progressPct = Math.max(0, Math.min(100, (cardsComplete / 78) * 100));

  const selectedDef: TarotCardDefault | null = useMemo(() => {
    if (selectedCardIndex == null) return null;
    return TAROT_CARDS_78[selectedCardIndex] ?? null;
  }, [selectedCardIndex]);

  const selectedCard = useMemo(() => {
    if (selectedCardIndex == null) return null;
    return cardsByIndex.get(selectedCardIndex) ?? null;
  }, [cardsByIndex, selectedCardIndex]);

  const ensureCardsForDeck = useCallback(async (): Promise<CardRow[]> => {
    const supabase = createClient();
    const deckIdTrimmed = deckId.trim();

    const { data: existingCards, error: cardsErr } = await supabase
      .from('cards')
      .select('id, deck_id, card_index, render_url, status')
      .eq('deck_id', deckIdTrimmed)
      .order('card_index');

    if (cardsErr) throw new Error(cardsErr.message);

    const existingByIndex = new Set((existingCards ?? []).map((c) => c.card_index));
    const missingCards = TAROT_CARDS_78.filter((card) => !existingByIndex.has(card.index));

    if (missingCards.length > 0) {
      const cardRecords = missingCards.map((card) => ({
        deck_id: deckId,
        card_index: card.index,
        numeral: card.numeral || '',
        card_name: card.name,
        status: 'empty',
      }));

      const { error: insertErr } = await supabase.from('cards').insert(cardRecords);
      if (insertErr) throw new Error(insertErr.message);
    }

    // Always refetch so UI reflects the database.
    const { data: refetchedCards, error: refetchErr } = await supabase
      .from('cards')
      .select('id, deck_id, card_index, render_url, status')
      .eq('deck_id', deckIdTrimmed)
      .order('card_index');

    if (refetchErr) throw new Error(refetchErr.message);

    const normalized = (refetchedCards ?? []) as CardRow[];
    setCards(normalized);
    return normalized;
  }, [deckId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const supabase = createClient();

        const deckIdForQuery = deckId.trim();
        console.log('deckId:', deckIdForQuery, '(raw:', deckId, ')');
        if (!deckId) {
          throw new Error('Missing deckId param');
        }
        const { data: d, error: deckErr } = await supabase
          .from('decks')
          .select('id, border_name, templated_template_id')
          .eq('id', deckIdForQuery)
          .limit(1)
          .maybeSingle();

        console.log('supabase data:', d);
        console.log('supabase error:', deckErr);

        if (deckErr) {
          console.error('Error loading deck:', deckErr);
          throw new Error(deckErr.message);
        }
        if (!d) {
          console.error('Error loading deck: Deck not found (data is null/undefined)');
          throw new Error('Deck not found');
        }
        if (cancelled) return;

        setDeck(d as Deck);

        // Initialize/fetch cards separately so deck fetch errors don't get masked.
        let ensuredCards: CardRow[] = [];
        try {
          ensuredCards = await ensureCardsForDeck();
        } catch (e) {
          console.error('Error initializing cards:', e);
          // Don't mask deck load errors with generic messages.
          throw e instanceof Error ? e : new Error('Failed to load cards');
        }

        // Default selection: first unrendered card, otherwise card 0.
        const firstUnrendered =
          ensuredCards.find((c) => c.status !== 'rendered')?.card_index ?? 0;
        if (!cancelled) setSelectedCardIndex(initialSelectedIndexFromQuery ?? firstUnrendered);
      } catch (e) {
        if (cancelled) return;
        console.error('Studio deck page load error:', e);
        setLoadError(e instanceof Error ? e.message : 'Failed to load deck');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deckId, ensureCardsForDeck, initialSelectedIndexFromQuery]);

  // Revoke object URLs when the selected file changes.
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const clearFileState = useCallback(() => {
    setFile(null);
    setValidationWarning(null);
    setValidationError(null);
    setActionError(null);
    setRenderSuccess(false);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
  }, [filePreviewUrl]);

  const selectCard = useCallback(
    (cardIndex: number) => {
      setSelectedCardIndex(cardIndex);
      clearFileState();
    },
    [clearFileState]
  );

  const handleFileInput = useCallback(
    async (f: File | null) => {
      setValidationWarning(null);
      setValidationError(null);
      setActionError(null);
      setRenderSuccess(false);

      if (!f) {
        clearFileState();
        return;
      }

      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

      const { warning, error } = await validateImageFile(f);
      const previewUrl = URL.createObjectURL(f);

      setFile(f);
      setFilePreviewUrl(previewUrl);
      setValidationWarning(warning);
      setValidationError(error);

      // If there's a blocking error, clear the file selection (but keep the preview revoked).
      if (error) {
        URL.revokeObjectURL(previewUrl);
        setFile(null);
        setFilePreviewUrl(null);
      }
    },
    [clearFileState, filePreviewUrl]
  );

  const uploadAndRender = useCallback(async () => {
    if (!deck || !selectedDef || !selectedCard || !file) return;

    setGenerating(true);
    setActionError(null);
    setRenderSuccess(false);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('deckId', deckId);
      form.append('cardIndex', String(selectedDef.index));

      const uploadRes = await fetch('/api/studio/upload', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setActionError(uploadData?.error || 'Upload failed');
        return;
      }

      const artworkUrl = uploadData?.url as string | undefined;
      if (!artworkUrl) {
        setActionError('Upload did not return an artwork URL');
        return;
      }

      const renderRes = await fetch('/api/studio/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          cardId: selectedCard.id,
          artworkUrl,
          cardName: selectedDef.name,
          numeral: selectedDef.numeral ?? '',
          templateId: deck.templated_template_id,
        }),
      });

      const renderData = await renderRes.json();
      if (!renderRes.ok) {
        setActionError(renderData?.error || 'Render failed');
        return;
      }

      const renderUrl = renderData?.renderUrl as string | undefined;
      if (!renderUrl) {
        setActionError('Render did not return a render URL');
        return;
      }

      // Optimistic update for instant UI feedback.
      setCards((prev) =>
        prev.map((c) =>
          c.id === selectedCard.id
            ? { ...c, render_url: renderUrl, status: 'rendered' }
            : c
        )
      );

      setRenderSuccess(true);
    } catch {
      setActionError('Something went wrong while rendering');
    } finally {
      setGenerating(false);
    }
  }, [deck, deckId, selectedCard, selectedDef, file]);

  const selectNextUnrendered = useCallback(() => {
    if (selectedCardIndex == null) return;

    const next = TAROT_CARDS_78.slice(selectedCardIndex + 1).find((def) => {
      const row = cardsByIndex.get(def.index);
      return row?.status !== 'rendered';
    });

    if (!next) {
      setActionError('Deck complete!');
      return;
    }

    selectCard(next.index);

    // Scroll the next card into view.
    requestAnimationFrame(() => {
      const el = document.getElementById(`studio-card-${next.index}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [cardsByIndex, selectCard, selectedCardIndex]);

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

  if (!deck) {
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/studio" className="text-charcoal/70 hover:text-charcoal">
            ← Studio
          </Link>
          <div className="text-right">
            <p className="text-sm text-charcoal/70">{cardsComplete} of 78 cards complete</p>
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-[2px] bg-[#e8e4dc]">
              <div
                className="h-full rounded-[2px] bg-charcoal transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-6 pb-[180px] pt-10">
        <h1 className="text-xl font-semibold text-charcoal">{deck.border_name}</h1>

        {TAROT_SECTIONS.map((section) => {
          const cardsInSection = TAROT_CARDS_78.slice(section.startIndex, section.endIndex);
          const suitTitle =
            section.title === 'Major Arcana' ? 'Major' : section.title;

          return (
            <section key={section.title}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/50">
                {section.title}
              </h2>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {cardsInSection.map((def) => {
                  const row = cardsByIndex.get(def.index);
                  const rendered = row?.status === 'rendered' && !!row.render_url;
                  const isSelected = selectedCardIndex === def.index;

                  return (
                    <button
                      key={def.index}
                      id={`studio-card-${def.index}`}
                      type="button"
                      onClick={() => selectCard(def.index)}
                      className={`relative cursor-pointer rounded-[2px] bg-cardBg p-3 text-left text-[13px] transition ${
                        isSelected
                          ? 'border-2 border-charcoal'
                          : 'border border-charcoal/10'
                      }`}
                    >
                      {rendered ? (
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-600" />
                          <span className="text-[11px] font-semibold text-emerald-700">✓</span>
                        </div>
                      ) : (
                        <div className="absolute right-2 top-2">
                          <span className="h-2 w-2 rounded-full bg-muted" />
                        </div>
                      )}

                      <div className="min-h-[68px]">
                        <div className="text-charcoal">
                          {def.numeral ? (
                            <span className="block text-charcoal">
                              {def.numeral}
                            </span>
                          ) : null}
                          <span className="block text-charcoal/90">{def.name}</span>
                        </div>
                      </div>

                      {rendered ? (
                        <div className="mt-2 relative aspect-[3/5] w-full overflow-hidden rounded-[2px] bg-parchment/60">
                          <NextImage
                            src={row!.render_url!}
                            alt={def.name}
                            fill
                            sizes="140px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : null}

                      <span className="sr-only">
                        {rendered ? 'Rendered' : 'Not started'}
                      </span>

                      <span className="sr-only">{suitTitle}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Sticky bottom panel */}
      {selectedCardIndex != null && selectedDef && selectedCard ? (
        <div className="sticky bottom-0 z-20 bg-cream">
          <div className="border-t border-charcoal/10 px-6 py-5">
            <div className="mx-auto max-w-6xl">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {selectedDef.name}
                    {selectedDef.numeral ? ` — ${selectedDef.numeral}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/70">
                    Suit: <span className="font-medium text-charcoal/90">{suitFromIndex(selectedDef.index)}</span>
                  </p>
                </div>
              </div>

              {actionError && (
                <div className="mb-3 rounded-sm border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
                <div>
                  <div
                    className="rounded-sm border-[1.5px] border-dashed border-charcoal/25 bg-parchment/20 p-8 text-center"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="text-sm font-medium text-charcoal/90">
                      Upload your artwork for {selectedDef.name}
                    </p>
                    <p className="mt-2 text-sm text-muted">PNG or JPG recommended</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        void handleFileInput(f);
                      }}
                      disabled={generating}
                    />
                  </div>

                  {validationError ? (
                    <p className="mt-3 text-sm text-red-700">{validationError}</p>
                  ) : null}
                  {validationWarning ? (
                    <p className="mt-3 text-sm text-charcoal/70">{validationWarning}</p>
                  ) : null}

                  {filePreviewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[2px] border border-charcoal/10 bg-cardBg">
                      <div className="relative aspect-[3/5] w-full">
                          <NextImage
                          src={filePreviewUrl}
                          alt="Artwork preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {!renderSuccess && (
                    <button
                      type="button"
                      onClick={() => void uploadAndRender()}
                      disabled={!file || generating}
                      className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-charcoal px-6 py-3 text-cream transition hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Spinner />
                          Rendering your card...
                        </>
                      ) : (
                        'Generate Card'
                      )}
                    </button>
                  )}

                  {renderSuccess && (
                    <div className="rounded-sm border border-charcoal/10 bg-parchment/40 p-3 text-sm text-charcoal">
                      <p className="font-semibold">Card complete!</p>
                      <p className="mt-1 text-charcoal/70">Select next card to keep going.</p>
                      <button
                        type="button"
                        onClick={selectNextUnrendered}
                        className="mt-3 w-full rounded-[2px] border border-charcoal/80 bg-cream px-6 py-3 text-charcoal transition hover:bg-charcoal/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select next card
                      </button>
                      {selectedCard.render_url ? (
                        <div className="mt-3 overflow-hidden rounded-[2px] border border-charcoal/10 bg-cardBg">
                          <div className="relative aspect-[3/5] w-full">
                            <NextImage
                              src={selectedCard.render_url}
                              alt={selectedDef.name}
                              fill
                              sizes="320px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

