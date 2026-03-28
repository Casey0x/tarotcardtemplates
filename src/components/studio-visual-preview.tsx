'use client';

import { createClient } from '@supabase/supabase-js';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import { getTarotDefault, TAROT_CARDS_78, TAROT_SECTIONS } from '@/lib/tarot-cards';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** Object path inside bucket `studio-uploads` from a public Supabase URL, or null. */
function studioObjectPathFromPublicUrl(url: string): string | null {
  const marker = '/object/public/studio-uploads/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try {
    const rest = url.slice(i + marker.length).split('?')[0];
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}

export type StudioPreviewItem = {
  slug: string;
  name: string;
  image: string;
  /** Transparent-center border PNG for live upload view; optional. */
  transparentImage?: string | null;
};

type Props = {
  borders: StudioPreviewItem[];
  /** Base path for Studio nav (e.g. "/studio" or "/studio-beta"). */
  studioBasePath?: string;
};

export function StudioVisualPreview({ borders, studioBasePath = '/studio' }: Props) {
  const [borderSlug, setBorderSlug] = useState(() => borders[0]?.slug ?? '');
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [cardName, setCardName] = useState(() => TAROT_CARDS_78[0]?.name ?? '');
  const [cardNumeral, setCardNumeral] = useState(() => TAROT_CARDS_78[0]?.numeral ?? '');
  const [artworkByCard, setArtworkByCard] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);

  function selectCard(index: number) {
    const d = getTarotDefault(index);
    if (!d) return;
    setSelectedCardIndex(index);
    setCardName(d.name);
    setCardNumeral(d.numeral);
    setPreviewError(null);
  }

  const artworkSrc = artworkByCard[selectedCardIndex] ?? null;

  /** Cached Templated render URL per card index (survives switching cards). */
  const [previewByCard, setPreviewByCard] = useState<Record<number, string>>({});
  const previewImage = previewByCard[selectedCardIndex] ?? null;
  const [renderLoading, setRenderLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      console.log('Uploading file:', file);

      const filePath = `studio-uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const { data, error } = await supabase.storage.from('studio-uploads').upload(filePath, file);

      console.log('Upload result:', { data, error });

      if (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
        return;
      }

      const { data: publicData } = supabase.storage.from('studio-uploads').getPublicUrl(filePath);

      console.log('Public URL:', publicData.publicUrl);

      if (!publicData?.publicUrl) {
        alert('Failed to generate public URL');
        return;
      }

      setArtworkByCard((prev) => ({
        ...prev,
        [selectedCardIndex]: publicData.publicUrl,
      }));
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[selectedCardIndex];
        return next;
      });
    } catch (err) {
      console.error('Upload crash:', err);
      alert('Upload crashed');
    } finally {
      setUploading(false);
    }
  };

  async function handleRemoveArtwork() {
    const name = cardName.trim() || getTarotDefault(selectedCardIndex)?.name || 'this card';
    if (!confirm(`Remove artwork for ${name}?`)) return;
    const url = artworkByCard[selectedCardIndex];
    if (url && !url.startsWith('blob:')) {
      const path = studioObjectPathFromPublicUrl(url);
      if (path) {
        const { error } = await supabase.storage.from('studio-uploads').remove([path]);
        if (error) console.warn('Storage remove:', error.message);
      }
    }
    setArtworkByCard((prev) => {
      const next = { ...prev };
      delete next[selectedCardIndex];
      return next;
    });
    setPreviewByCard((prev) => {
      const next = { ...prev };
      delete next[selectedCardIndex];
      return next;
    });
    setPreviewError(null);
  }

  function saveAndNextCard() {
    if (!artworkSrc) return;
    if (selectedCardIndex >= 77) return;
    const next = selectedCardIndex + 1;
    selectCard(next);
    requestAnimationFrame(() => {
      document
        .querySelector(`.studio-card-nav [data-studio-card-index="${next}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  async function handlePreviewCard() {
    if (uploading) {
      alert('Please wait for upload to finish');
      return;
    }

    const artwork = artworkSrc;
    const numeral = cardNumeral;
    const cardNameTrimmed = cardName.trim();

    if (!artwork) {
      alert('Please upload artwork first');
      return;
    }
    if (!cardNameTrimmed) {
      return;
    }

    setRenderLoading(true);
    setPreviewError(null);
    try {
      let artworkPayload = artwork;
      if (artwork.startsWith('blob:')) {
        artworkPayload = await blobUrlToDataUrl(artwork);
      }

      console.log('Artwork being sent:', artworkByCard[selectedCardIndex]);

      const res = await fetch('/api/render-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artwork: artworkPayload,
          numeral,
          card_name: cardNameTrimmed,
        }),
      });

      let data: { image_url?: string; error?: string };
      try {
        data = (await res.json()) as { image_url?: string; error?: string };
      } catch {
        setPreviewByCard((prev) => {
          const next = { ...prev };
          delete next[selectedCardIndex];
          return next;
        });
        console.error(res);
        setPreviewError('Preview failed — check console');
        return;
      }

      console.log('Render result:', data);

      if (!res.ok || !data.image_url) {
        setPreviewByCard((prev) => {
          const next = { ...prev };
          delete next[selectedCardIndex];
          return next;
        });
        console.error(res);
        alert('Render failed');
        setPreviewError('Preview failed — check console');
        return;
      }

      setPreviewByCard((prev) => ({ ...prev, [selectedCardIndex]: data.image_url! }));
      setPreviewError(null);
    } catch {
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[selectedCardIndex];
        return next;
      });
      console.error(new Error('Preview request failed'));
      setPreviewError('Preview failed — check console');
    } finally {
      setRenderLoading(false);
    }
  }

  const completedCount = useMemo(
    () => Object.values(artworkByCard).filter((u) => typeof u === 'string' && u.length > 0).length,
    [artworkByCard]
  );

  /** Cream default for empty state; transparent variant when user has artwork (if configured). */
  const borderOverlaySrc = useMemo(() => {
    const b = borders.find((x) => x.slug === borderSlug) ?? borders[0];
    const fallback = b?.image?.trim() && b.image.trim().length > 0 ? b.image.trim() : FALLBACK_BORDER_IMAGE;
    const transparent = b?.transparentImage?.trim();
    if (artworkSrc && transparent) return transparent;
    return fallback;
  }, [borders, borderSlug, artworkSrc]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal">Studio</h1>
          <p className="mt-2 text-sm text-charcoal/70">
            Preview how a border frames your artwork. No saving — visual only.
          </p>
        </div>
        <Link
          href={`${studioBasePath}/projects`}
          className="text-sm text-charcoal underline underline-offset-2 hover:no-underline"
        >
          My deck projects →
        </Link>
      </div>

      <div className="mt-4 rounded-sm border border-charcoal/10 bg-cream/60 px-4 py-3">
        <p className="text-sm font-medium text-charcoal">
          Card {selectedCardIndex + 1} of 78 — {cardName || getTarotDefault(selectedCardIndex)?.name}
        </p>
        <p className="mt-1 text-xs text-charcoal/60">
          Progress: {completedCount} / 78 cards completed
        </p>
      </div>

      <section className="mt-5 max-w-2xl border-b border-charcoal/5 pb-5" aria-label="About this builder">
        <h2 className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
          About this builder
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
          This tool lets you create your own tarot deck using purchased borders. You are not editing
          a pre-designed template.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-charcoal/60">
          Pre-made decks (like Gatsby Tarot) are separate products and are not used in Studio.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-charcoal/60">
          Start by selecting a card and uploading your artwork.
        </p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(11rem,13rem)_1fr_minmax(0,15rem)] lg:items-start">
        <nav
          className="studio-card-nav max-h-[70vh] space-y-4 overflow-y-auto rounded-sm border border-charcoal/10 bg-cream/80 p-3 lg:max-h-[min(70vh,52rem)]"
          aria-label="Tarot cards"
        >
          {TAROT_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="sticky top-0 bg-cream/95 py-1 text-[10px] font-medium uppercase tracking-wide text-charcoal/50">
                {section.title === 'Major Arcana' ? 'Major Arcana' : `Minor · ${section.title}`}
              </h2>
              <ul className="mt-1 space-y-0.5">
                {TAROT_CARDS_78.slice(section.startIndex, section.endIndex).map((card) => {
                  const done = Boolean(artworkByCard[card.index]);
                  const active = selectedCardIndex === card.index;
                  return (
                    <li key={card.index}>
                      <button
                        type="button"
                        data-studio-card-index={card.index}
                        onClick={() => selectCard(card.index)}
                        aria-current={active ? 'true' : undefined}
                        aria-label={`${card.name}${done ? ', artwork added' : ', no artwork yet'}`}
                        className={`flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-xs transition-colors ${
                          active ? 'bg-charcoal text-cream' : 'text-charcoal hover:bg-charcoal/5'
                        }`}
                      >
                        <span
                          className={`w-3.5 shrink-0 text-center text-[10px] leading-none ${
                            active
                              ? done
                                ? 'text-cream'
                                : 'text-cream/45'
                              : done
                                ? 'text-charcoal'
                                : 'text-charcoal/35'
                          }`}
                          aria-hidden
                        >
                          {done ? '✓' : '○'}
                        </span>
                        <span className="min-w-0 flex-1 truncate" title={card.name}>
                          {card.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative w-full max-w-sm overflow-hidden rounded-sm border border-charcoal/10 ${
              artworkSrc ? 'bg-transparent' : 'bg-cream/90'
            }`}
            style={{ aspectRatio: '2 / 3' }}
          >
            {artworkSrc && !previewImage ? (
              <img
                src={artworkSrc}
                alt=""
                className="absolute left-[3%] top-[3%] z-[5] h-[94%] w-[94%] object-cover"
              />
            ) : null}

            {/* Templated preview must sit above the border layer (z-10). Many border PNGs are opaque in the center, which hides anything underneath. */}
            {previewImage ? (
              <img
                src={previewImage}
                alt="Templated card render preview"
                loading="eager"
                decoding="async"
                className="pointer-events-none absolute inset-0 z-[20] h-full w-full object-contain"
                onError={() => {
                  setPreviewError('Could not load preview image (blocked URL or invalid image).');
                  setPreviewByCard((prev) => {
                    const next = { ...prev };
                    delete next[selectedCardIndex];
                    return next;
                  });
                }}
              />
            ) : null}

            {!previewImage ? (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-[5%] z-[7] px-2 text-center">
                  {cardNumeral.trim() ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-charcoal drop-shadow-sm sm:text-xs">
                      {cardNumeral}
                    </span>
                  ) : null}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-[6%] z-[7] px-2 text-center">
                  <span className="text-[10px] font-semibold leading-tight text-charcoal drop-shadow-sm sm:text-xs">
                    {cardName}
                  </span>
                </div>
              </>
            ) : null}

            {!previewImage ? (
              <Image
                src={borderOverlaySrc}
                alt="Border overlay"
                fill
                className="pointer-events-none z-10 object-contain"
                sizes="(max-width: 1024px) 100vw, 384px"
                priority
              />
            ) : null}
            {!artworkSrc ? (
              <>
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-cream/80 px-4 text-center">
                  <p className="max-w-[14rem] text-xs leading-snug text-charcoal/60">
                    Upload your artwork to begin designing this card
                  </p>
                  <p className="mt-1.5 text-xs text-charcoal/50">PNG or JPG recommended</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="absolute inset-0 z-[25] cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                    e.target.value = '';
                  }}
                  aria-label="Upload artwork for this card"
                />
              </>
            ) : null}
          </div>
          <p className="mx-auto mt-3 max-w-sm px-2 text-center text-[10px] leading-relaxed text-charcoal/55">
            After upload, your image appears in the preview above inside the border you pick. Preview
            Card swaps that for the full Templated render (art, template frame, and text in one
            image).
          </p>
          {previewImage && artworkSrc ? (
            <button
              type="button"
              className="mx-auto mt-2 block text-center text-xs text-charcoal underline underline-offset-2 hover:no-underline"
              onClick={() => {
                setPreviewByCard((prev) => {
                  const next = { ...prev };
                  delete next[selectedCardIndex];
                  return next;
                });
                setPreviewError(null);
              }}
            >
              Back to upload in frame
            </button>
          ) : null}
          {borders.length === 0 && (
            <p className="mt-4 text-center text-sm text-charcoal/70">
              Load borders from the data source to use this preview.
            </p>
          )}

          {uploading ? (
            <p className="mt-4 text-center text-xs text-charcoal/60">Uploading…</p>
          ) : null}
          {renderLoading ? (
            <p className="mt-4 text-center text-xs text-charcoal/60">Rendering…</p>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-sm border border-charcoal/10 bg-cream/80 p-4">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Border</h2>
            {borders.length === 0 ? (
              <p className="mt-1 text-xs text-charcoal/70">No borders loaded.</p>
            ) : (
              <label className="mt-2 block text-xs text-charcoal/70">
                <span className="sr-only">Choose border</span>
                <select
                  className="mt-1 w-full rounded-sm border border-charcoal/20 bg-cream px-2 py-2 text-sm text-charcoal"
                  value={borderSlug}
                  onChange={(e) => setBorderSlug(e.target.value)}
                >
                  {borders.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <h2 className="text-sm font-semibold text-charcoal">Card text</h2>
            <p className="mt-1 text-[10px] text-charcoal/55">
              Defaults for {getTarotDefault(selectedCardIndex)?.name ?? 'this card'}. Edit as needed.
            </p>
            <label className="mt-3 block text-xs text-charcoal/70">
              Card name
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1 w-full rounded-sm border border-charcoal/20 bg-cream px-2 py-2 text-sm text-charcoal"
                autoComplete="off"
              />
            </label>
            <label className="mt-3 block text-xs text-charcoal/70">
              Numeral
              <input
                type="text"
                value={cardNumeral}
                onChange={(e) => setCardNumeral(e.target.value)}
                className="mt-1 w-full rounded-sm border border-charcoal/20 bg-cream px-2 py-2 text-sm text-charcoal"
                autoComplete="off"
                placeholder="e.g. VIII or leave empty"
              />
            </label>
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <label className="block text-xs text-charcoal/70">
              Replace artwork
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                className="mt-1 w-full text-xs text-charcoal file:mr-2 file:rounded-sm file:border file:border-charcoal/20 file:bg-cream file:px-2 file:py-1 disabled:opacity-50"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUpload(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>
            {artworkSrc ? (
              <button
                type="button"
                disabled={uploading}
                onClick={() => void handleRemoveArtwork()}
                className="mt-2 text-xs text-red-700/80 underline decoration-red-700/40 underline-offset-2 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove artwork
              </button>
            ) : null}
          </div>

          <div className="border-t border-charcoal/10 pt-4">
            <button
              type="button"
              onClick={() => void handlePreviewCard()}
              disabled={uploading || renderLoading || !artworkSrc || !cardName.trim()}
              className="w-full rounded-sm border border-charcoal bg-charcoal px-3 py-2 text-xs font-medium text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Preview Card
            </button>
            {artworkSrc ? (
              <button
                type="button"
                disabled={selectedCardIndex >= 77}
                onClick={saveAndNextCard}
                className="mt-2 w-full rounded-sm border border-charcoal/30 bg-transparent px-3 py-2 text-xs font-medium text-charcoal transition hover:bg-charcoal/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedCardIndex >= 77 ? 'All cards done!' : 'Save & Next Card →'}
              </button>
            ) : null}
            <p className="mt-2 text-[10px] leading-snug text-charcoal/55">
              Requires artwork and card name. While editing, the preview shows your upload under the
              site border; after preview, use “Back to upload in frame” below the card to return.
            </p>
            {previewError ? (
              <p className="mt-2 text-xs text-charcoal/80" role="alert">
                {previewError}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
