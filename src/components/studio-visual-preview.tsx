'use client';

import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import type { StudioPreviewItem } from '@/lib/studio-border-options';
import { getTarotDefault, TAROT_CARDS_78, TAROT_SECTIONS } from '@/lib/tarot-cards';

export type { StudioPreviewItem } from '@/lib/studio-border-options';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

type Props = {
  borders: StudioPreviewItem[];
  /** Full border list (names / slugs) when `borders` is filtered for the dropdown. */
  borderCatalog: StudioPreviewItem[];
  /** Base path for Studio nav (e.g. "/studio" or "/studio-beta"). */
  studioBasePath?: string;
  /** Pre-select in dropdown when valid. */
  initialBorderSlug?: string;
  /** Paid `border_slug` values for the signed-in user. */
  purchasedBorderSlugs?: string[];
  trialRendersUsed?: number;
  isLoggedIn?: boolean;
  trialExhaustedNoPurchase?: boolean;
};

export function StudioVisualPreview({
  borders,
  borderCatalog,
  studioBasePath = '/studio',
  initialBorderSlug,
  purchasedBorderSlugs = [],
  trialRendersUsed: trialRendersUsedProp = 0,
  isLoggedIn = false,
  trialExhaustedNoPurchase = false,
}: Props) {
  const router = useRouter();
  const catalog = borderCatalog.length ? borderCatalog : borders;

  const firstSlug = borders[0]?.slug ?? '';
  const resolvedInitial =
    initialBorderSlug && borders.some((b) => b.slug === initialBorderSlug) ? initialBorderSlug : firstSlug;
  const [borderSlug, setBorderSlug] = useState(resolvedInitial);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  useEffect(() => {
    if (initialBorderSlug && borders.some((b) => b.slug === initialBorderSlug)) {
      setBorderSlug(initialBorderSlug);
    }
  }, [initialBorderSlug, borders]);

  useEffect(() => {
    if (!borders.length) return;
    if (!borders.some((b) => b.slug === borderSlug)) {
      setBorderSlug(borders[0].slug);
    }
  }, [borders, borderSlug]);

  const [sessionLoggedIn, setSessionLoggedIn] = useState(isLoggedIn);
  useEffect(() => {
    setSessionLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const [trialRendersUsed, setTrialRendersUsed] = useState(trialRendersUsedProp);
  useEffect(() => {
    setTrialRendersUsed(trialRendersUsedProp);
  }, [trialRendersUsedProp]);

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

  const [previewByCard, setPreviewByCard] = useState<Record<number, string>>({});
  const previewImage = previewByCard[selectedCardIndex] ?? null;
  const [renderLoading, setRenderLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showTrialPaywall, setShowTrialPaywall] = useState(false);

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

  const openSignInPrompt = () => setShowSignInPrompt(true);

  const handleUpload = async (file: File) => {
    if (!sessionLoggedIn) {
      openSignInPrompt();
      return;
    }
    try {
      setUploading(true);

      const filePath = `studio-uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const { data, error } = await supabase.storage.from('studio-uploads').upload(filePath, file);

      if (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
        return;
      }

      const { data: publicData } = supabase.storage.from('studio-uploads').getPublicUrl(filePath);

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
    if (!sessionLoggedIn) {
      openSignInPrompt();
      return;
    }
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

  function trialBlocksPreview(): boolean {
    return (
      sessionLoggedIn && !borderOwned && trialRendersUsed >= 2
    );
  }

  async function handlePreviewCard() {
    if (!sessionLoggedIn) {
      openSignInPrompt();
      return;
    }
    if (uploading) {
      alert('Please wait for upload to finish');
      return;
    }
    if (trialBlocksPreview()) {
      setShowTrialPaywall(true);
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

      const res = await fetch('/api/render-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artwork: artworkPayload,
          numeral,
          card_name: cardNameTrimmed,
          border_id: borderSlug,
        }),
      });

      let data: { image_url?: string; error?: string; trial_renders_used?: number };
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setPreviewByCard((prev) => {
          const next = { ...prev };
          delete next[selectedCardIndex];
          return next;
        });
        setPreviewError('Preview failed — check console');
        return;
      }

      if (res.status === 403 && data.error) {
        setShowTrialPaywall(true);
        setPreviewError(null);
        return;
      }

      if (res.status === 401) {
        openSignInPrompt();
        setPreviewError(null);
        return;
      }

      if (!res.ok || !data.image_url) {
        setPreviewByCard((prev) => {
          const next = { ...prev };
          delete next[selectedCardIndex];
          return next;
        });
        alert(data.error || 'Render failed');
        setPreviewError('Preview failed — check console');
        return;
      }

      if (typeof data.trial_renders_used === 'number') {
        setTrialRendersUsed(data.trial_renders_used);
      }

      setPreviewByCard((prev) => ({ ...prev, [selectedCardIndex]: data.image_url! }));
      setPreviewError(null);
    } catch {
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[selectedCardIndex];
        return next;
      });
      setPreviewError('Preview failed — check console');
    } finally {
      setRenderLoading(false);
    }
  }

  const completedCount = useMemo(
    () => Object.values(artworkByCard).filter((u) => typeof u === 'string' && u.length > 0).length,
    [artworkByCard]
  );

  const borderOwned = useMemo(
    () => purchasedBorderSlugs.includes(borderSlug),
    [purchasedBorderSlugs, borderSlug]
  );

  const currentBorderName = useMemo(
    () => catalog.find((b) => b.slug === borderSlug)?.name ?? 'This border',
    [catalog, borderSlug]
  );

  const borderOverlaySrc = useMemo(() => {
    const b = catalog.find((x) => x.slug === borderSlug) ?? catalog[0];
    return b?.image?.trim() && b.image.trim().length > 0 ? b.image.trim() : FALLBACK_BORDER_IMAGE;
  }, [catalog, borderSlug]);

  const mobileCardSelectValue = String(selectedCardIndex);
  const loginRedirect = `${studioBasePath}${borderSlug ? `?border=${encodeURIComponent(borderSlug)}` : ''}`;

  const trialRemaining = Math.max(0, 2 - trialRendersUsed);
  const showFreeTrialLine =
    sessionLoggedIn && !borderOwned && trialRendersUsed < 2;
  const showTrialCompleteLine = sessionLoggedIn && !borderOwned && trialRendersUsed >= 2;

  if (trialExhaustedNoPurchase && borders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-charcoal">Studio</h1>
            <p className="mt-2 text-sm text-charcoal/70">
              Design your tarot deck card by card. Choose a border, upload your artwork, and export print-ready files.
            </p>
          </div>
          <Link
            href={`${studioBasePath}/projects`}
            className="text-sm text-charcoal underline underline-offset-2 hover:no-underline"
          >
            My deck projects →
          </Link>
        </div>
        <div className="rounded-sm border border-charcoal/15 bg-cream/80 px-5 py-10 text-center">
          <p className="text-sm font-medium text-charcoal">Your free trial is complete</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/70">
            Purchase a border to keep designing all 78 cards, save your progress, and export print-ready files.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/borders"
              className="inline-flex rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-xs font-medium text-cream hover:bg-charcoal/90"
            >
              Browse borders
            </Link>
            <Link
              href="/account"
              className="inline-flex rounded-sm border border-charcoal/35 bg-cream px-4 py-2 text-xs font-medium text-charcoal hover:bg-charcoal/5"
            >
              Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {showSignInPrompt ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-signin-title"
        >
          <div className="w-full max-w-md rounded-t-sm border border-charcoal/15 bg-cream p-6 shadow-lg sm:rounded-sm">
            <h2 id="studio-signin-title" className="text-lg font-semibold text-charcoal">
              Sign in to continue
            </h2>
            <p className="mt-2 text-sm text-charcoal/75">
              Sign in to start your free trial — preview 2 cards for free with any border.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
              >
                Sign in
              </Link>
              <button
                type="button"
                className="inline-flex justify-center rounded-sm border border-charcoal/30 bg-transparent px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5"
                onClick={() => setShowSignInPrompt(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showTrialPaywall ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-charcoal/40 lg:items-center lg:justify-center lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-paywall-title"
        >
          <div className="flex min-h-0 flex-1 flex-col bg-cream lg:min-h-0 lg:max-h-[90vh] lg:max-w-md lg:flex-none lg:rounded-sm lg:border lg:border-charcoal/15 lg:shadow-lg">
            <div className="flex-1 overflow-y-auto p-6 lg:flex-none">
              <h2 id="studio-paywall-title" className="text-lg font-semibold text-charcoal">
                Your free trial is complete
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                You&apos;ve previewed 2 cards with {currentBorderName}. Purchase it for $9.95 to design all 78 cards,
                save your progress, and export print-ready files.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 border-t border-charcoal/10 bg-cream px-6 py-4 lg:rounded-b-sm">
              <Link
                href={`/borders/${borderSlug}`}
                className="inline-flex w-full justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-3 text-center text-sm font-medium text-cream hover:bg-charcoal/90"
              >
                Buy {currentBorderName} — $9.95
              </Link>
              <Link
                href="/borders"
                className="inline-flex w-full justify-center rounded-sm border border-charcoal/30 bg-transparent px-4 py-3 text-sm text-charcoal hover:bg-charcoal/5"
              >
                Browse other borders
              </Link>
              <button
                type="button"
                className="mt-1 text-center text-sm text-charcoal/60 underline underline-offset-2 hover:text-charcoal"
                onClick={() => setShowTrialPaywall(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-charcoal">Studio</h1>
          <p className="mt-2 text-sm text-charcoal/70">
            Design your tarot deck card by card. Choose a border, upload your artwork, and export print-ready files.
          </p>
          {sessionLoggedIn && !borderOwned && trialRendersUsed < 2 ? (
            <p className="mt-1 text-xs text-charcoal/55">
              Try any border — your first 2 preview renders are free. Purchase to save progress and export everything.
            </p>
          ) : sessionLoggedIn && !borderOwned && trialRendersUsed >= 2 ? (
            <p className="mt-1 text-xs text-charcoal/55">
              Free trial complete for previews. Purchase this border to keep rendering and exporting.
            </p>
          ) : null}
        </div>
        <Link
          href={`${studioBasePath}/projects`}
          className="text-sm text-charcoal underline underline-offset-2 hover:no-underline"
        >
          My deck projects →
        </Link>
      </div>

      <div className="mb-4 w-full rounded-sm border border-charcoal/10 bg-cream/60 px-4 py-3">
        <p className="text-sm font-medium text-charcoal">
          Card {selectedCardIndex + 1} of 78 — {cardName || getTarotDefault(selectedCardIndex)?.name}
        </p>
        <p className="mt-1 text-xs text-charcoal/60">Progress: {completedCount} / 78 cards completed</p>
        {showFreeTrialLine ? (
          <p className="mt-2 text-xs text-charcoal/50">
            {trialRemaining === 2
              ? 'Free trial: 2 renders remaining'
              : trialRemaining === 1
                ? 'Free trial: 1 render remaining'
                : null}
          </p>
        ) : null}
        {showTrialCompleteLine ? (
          <p className="mt-2 text-xs text-charcoal/55">
            Free trial complete. Purchase this border ($9.95) to continue designing.{' '}
            <Link href={`/borders/${borderSlug}`} className="font-medium text-charcoal underline underline-offset-2 hover:no-underline">
              Buy Border →
            </Link>
          </p>
        ) : null}
      </div>

      {borderOwned ? (
        <div className="mb-4 w-full rounded-sm border border-emerald-800/20 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
          ✓ {currentBorderName} — Owned. Your work is saved automatically.
        </div>
      ) : (
        <div className="mb-4 w-full rounded-sm border border-amber-700/25 bg-amber-50/95 px-4 py-3 text-sm text-charcoal">
          <p className="font-medium">
            {sessionLoggedIn && trialRendersUsed < 2
              ? `You're using ${currentBorderName} with your free trial. Purchase for $9.95 to save your work and export print-ready cards.`
              : `You're previewing ${currentBorderName}. Purchase it for $9.95 to save your work and export print-ready cards.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={`/borders/${borderSlug}`}
              className="inline-flex rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-xs font-medium text-cream hover:bg-charcoal/90"
            >
              Buy This Border — $9.95
            </Link>
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(loginRedirect)}`}
              className="inline-flex rounded-sm border border-charcoal/40 bg-cream px-4 py-2 text-xs font-medium text-charcoal hover:bg-charcoal/5"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      <section className="mt-5 hidden max-w-2xl border-b border-charcoal/5 pb-5 lg:block" aria-label="About this builder">
        <h2 className="text-xs font-medium uppercase tracking-wide text-charcoal/50">About this builder</h2>
        <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
          This tool lets you create your own tarot deck using purchased borders. You are not editing a pre-designed
          template.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-charcoal/60">
          Pre-made decks (like Gatsby Tarot) are separate products and are not used in Studio.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-charcoal/60">Start by selecting a card and uploading your artwork.</p>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(11rem,13rem)_1fr_minmax(0,15rem)]">
        {/* mobile order 1 / desktop col 3 row 1: border + card text */}
        <div className="space-y-4 rounded-sm border border-charcoal/10 bg-cream/80 p-4 lg:col-start-3 lg:row-start-1">
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
        </div>

        {/* mobile order 2 / desktop col 2 */}
        <div className="flex flex-col items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div
            className={`relative w-full max-w-[280px] rounded-sm border border-charcoal/10 sm:max-w-sm lg:max-w-sm ${
              artworkSrc ? 'overflow-visible bg-transparent' : 'overflow-hidden bg-cream/90'
            }`}
            style={{ aspectRatio: '2 / 3' }}
          >
            {!previewImage ? (
              <Image
                src={borderOverlaySrc}
                alt="Border overlay"
                fill
                className="pointer-events-none z-[8] object-contain"
                sizes="(max-width: 1024px) 280px, 384px"
                priority
              />
            ) : null}

            {artworkSrc && !previewImage ? (
              <img
                src={artworkSrc}
                alt="Uploaded tarot artwork preview in the card frame"
                className="absolute left-[5%] top-[5%] z-[14] h-[90%] w-[90%] rounded-[4px] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.15)]"
              />
            ) : null}

            {previewImage ? (
              <div className="absolute inset-0 z-[20] h-full w-full">
                <img
                  src={previewImage}
                  alt="Templated card render preview"
                  loading="eager"
                  decoding="async"
                  className="pointer-events-none h-full w-full object-contain"
                  onError={() => {
                    setPreviewError('Could not load preview image (blocked URL or invalid image).');
                    setPreviewByCard((prev) => {
                      const next = { ...prev };
                      delete next[selectedCardIndex];
                      return next;
                    });
                  }}
                />
              </div>
            ) : null}

            {!previewImage ? (
              <>
                {borderSlug !== 'day-of-the-dead' ? (
                  <div className="top-banner pointer-events-none absolute inset-x-0 top-[5%] z-[16] px-2 text-center">
                    {cardNumeral.trim() ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-charcoal drop-shadow-sm sm:text-xs">
                        {cardNumeral || ''}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="bottom-banner pointer-events-none absolute inset-x-0 bottom-[6%] z-[16] px-2 text-center">
                  <span className="text-[10px] font-semibold leading-tight text-charcoal drop-shadow-sm sm:text-xs">
                    {borderSlug === 'day-of-the-dead'
                      ? cardNumeral.trim()
                        ? `${cardNumeral.trim()} ${cardName.trim()}`.trim()
                        : cardName || ''
                      : cardName || ''}
                  </span>
                </div>
              </>
            ) : null}
            {!artworkSrc ? (
              <>
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-cream/80 px-3 text-center sm:px-4">
                  <p className="max-w-[16rem] text-[11px] leading-snug text-charcoal/60 sm:text-xs">
                    Upload your artwork to begin designing this card
                  </p>
                  <p className="mt-1.5 text-[10px] text-charcoal/50 sm:text-xs">PNG or JPG recommended</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="absolute inset-0 z-[25] cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    if (!sessionLoggedIn) {
                      openSignInPrompt();
                      e.target.value = '';
                      return;
                    }
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                    e.target.value = '';
                  }}
                  aria-label="Upload artwork for this card"
                />
              </>
            ) : null}
          </div>
          <p className="mx-auto mt-3 hidden max-w-sm px-2 text-center text-[10px] leading-relaxed text-charcoal/55 sm:block">
            After upload, your image appears in the preview above inside the border you pick. Preview Card swaps that for
            the full Templated render (art, template frame, and text in one image).
          </p>
          {previewImage && artworkSrc ? (
            <button
              type="button"
              className="mx-auto mt-2 hidden text-center text-xs text-charcoal underline underline-offset-2 hover:no-underline sm:block"
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

          {uploading ? <p className="mt-4 text-center text-xs text-charcoal/60">Uploading…</p> : null}
          {renderLoading ? <p className="mt-4 text-center text-xs text-charcoal/60">Rendering…</p> : null}
        </div>

        {/* mobile order 3 / desktop col 3 row 2: upload + preview */}
        <div className="space-y-4 lg:col-start-3 lg:row-start-2">
          <div className="space-y-4 rounded-sm border border-charcoal/10 bg-cream/80 p-4 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="border-t border-charcoal/10 pt-4 first:mt-0 first:border-t-0 first:pt-0 lg:mt-0 lg:border-t lg:pt-4">
              <label className="block text-xs text-charcoal/70">
                Replace artwork
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="mt-1 w-full text-xs text-charcoal file:mr-2 file:rounded-sm file:border file:border-charcoal/20 file:bg-cream file:px-2 file:py-1 disabled:opacity-50"
                  onChange={(e) => {
                    if (!sessionLoggedIn) {
                      openSignInPrompt();
                      e.target.value = '';
                      return;
                    }
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
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

            <div className="sticky bottom-0 z-30 -mx-1 border-t border-charcoal/10 bg-cream/95 px-1 py-3 backdrop-blur-sm lg:static lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <button
                type="button"
                onClick={() => void handlePreviewCard()}
                disabled={uploading || renderLoading || !artworkSrc || !cardName.trim()}
                className="w-full rounded-sm border border-charcoal bg-charcoal px-3 py-3 text-sm font-medium text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50 lg:py-2 lg:text-xs"
              >
                Preview Card
              </button>
              {previewImage && artworkSrc ? (
                <button
                  type="button"
                  className="mt-2 w-full text-center text-xs text-charcoal underline underline-offset-2 hover:no-underline lg:mt-2"
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
              <p className="mt-2 hidden text-[10px] leading-snug text-charcoal/55 lg:block">
                Requires artwork and card name. While editing, the preview shows your upload under the site border;
                after preview, use “Back to upload in frame” below the card to return.
              </p>
              {previewError ? (
                <p className="mt-2 text-xs text-charcoal/80" role="alert">
                  {previewError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* mobile order 4 / desktop col 1 */}
        <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <nav
            className="studio-card-nav hidden max-h-[70vh] space-y-4 overflow-y-auto rounded-sm border border-charcoal/10 bg-cream/80 p-3 lg:block lg:max-h-[min(70vh,52rem)]"
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
                              active ? (done ? 'text-cream' : 'text-cream/45') : done ? 'text-charcoal' : 'text-charcoal/35'
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

          <div className="rounded-sm border border-charcoal/10 bg-cream/80 p-3 lg:hidden">
            <label className="block text-xs font-medium text-charcoal">
              <span className="text-charcoal/70">Choose card</span>
              <select
                className="mt-2 w-full rounded-sm border border-charcoal/20 bg-cream px-2 py-2 text-sm text-charcoal"
                value={mobileCardSelectValue}
                onChange={(e) => selectCard(Number(e.target.value))}
              >
                {TAROT_SECTIONS.map((section) => (
                  <optgroup
                    key={section.title}
                    label={section.title === 'Major Arcana' ? 'Major Arcana' : `Minor · ${section.title}`}
                  >
                    {TAROT_CARDS_78.slice(section.startIndex, section.endIndex).map((card) => {
                      const done = Boolean(artworkByCard[card.index]);
                      return (
                        <option key={card.index} value={card.index}>
                          {done ? '✓ ' : ''}
                          {card.name}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
