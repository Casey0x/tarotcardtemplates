'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import type { StudioPreviewItem } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-client';
import { getTarotDefault, TAROT_CARDS_78, TAROT_SECTIONS } from '@/lib/tarot-cards';

export type { StudioPreviewItem } from '@/lib/studio-border-options';

type Props = {
  borders: StudioPreviewItem[];
  /** Full border list (names / slugs) when `borders` is filtered for the dropdown. */
  borderCatalog: StudioPreviewItem[];
  /** Base path for Studio nav (e.g. "/studio" or "/studio-beta"). */
  studioBasePath?: string;
  /** Pre-select on the first-time border picker when valid (`?border=`). */
  initialBorderSlug?: string;
  /** Border slugs with a paid export unlock (Stripe `purchases` / `orders`). */
  exportUnlockedBorderSlugs?: string[];
  /** No borders configured in the catalog. */
  noBordersInCatalog?: boolean;
};

export function StudioVisualPreview({
  borders,
  borderCatalog,
  studioBasePath = '/studio',
  initialBorderSlug,
  exportUnlockedBorderSlugs = [],
  noBordersInCatalog = false,
}: Props) {
  const router = useRouter();
  const catalog = borderCatalog.length ? borderCatalog : borders;

  const firstSlug = catalog[0]?.slug ?? '';
  const resolvedInitialSetupSlug =
    initialBorderSlug && catalog.some((b) => b.slug === initialBorderSlug) ? initialBorderSlug : firstSlug;

  type FlowPhase = 'loading' | 'setup' | 'builder';
  const [flowPhase, setFlowPhase] = useState<FlowPhase>('loading');
  const [deckBorderSlug, setDeckBorderSlug] = useState<string>('');
  const [setupSelectedSlug, setSetupSelectedSlug] = useState(resolvedInitialSetupSlug);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [startingDeck, setStartingDeck] = useState(false);

  const [changeBorderOpen, setChangeBorderOpen] = useState(false);
  const [changeBorderStep, setChangeBorderStep] = useState<'warn' | 'pick'>('pick');
  const [changePickSlug, setChangePickSlug] = useState<string>('');
  const [changeBorderBusy, setChangeBorderBusy] = useState(false);
  /** Server said stored renders exist even if local `renderedCount` is stale. */
  const [forceConfirmClearRenders, setForceConfirmClearRenders] = useState(false);

  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  useEffect(() => {
    if (initialBorderSlug && catalog.some((b) => b.slug === initialBorderSlug)) {
      setSetupSelectedSlug(initialBorderSlug);
    }
  }, [initialBorderSlug, catalog]);

  useEffect(() => {
    if (!catalog.length) return;
    if (!catalog.some((b) => b.slug === setupSelectedSlug)) {
      setSetupSelectedSlug(catalog[0].slug);
    }
  }, [catalog, setupSelectedSlug]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const [cardName, setCardName] = useState(() => TAROT_CARDS_78[0]?.name ?? '');
  const [cardNumeral, setCardNumeral] = useState(() => TAROT_CARDS_78[0]?.numeral ?? '');
  const [artworkByCard, setArtworkByCard] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [saveStatusSaving, setSaveStatusSaving] = useState(false);
  const [saveStatusSaved, setSaveStatusSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const cardFieldsRef = useRef<Record<number, { cardName: string; numeral: string }>>({});
  const artworkByCardRef = useRef(artworkByCard);
  /** Storage path in private bucket `studio-uploads` (not a display URL). */
  const artworkPathByCardRef = useRef<Record<number, string>>({});
  const selectedCardIndexRef = useRef(0);
  useEffect(() => {
    artworkByCardRef.current = artworkByCard;
  }, [artworkByCard]);
  useEffect(() => {
    selectedCardIndexRef.current = selectedCardIndex;
  }, [selectedCardIndex]);

  useEffect(() => {
    cardFieldsRef.current[selectedCardIndex] = { cardName, numeral: cardNumeral };
  }, [selectedCardIndex, cardName, cardNumeral]);

  type SessionCardRow = {
    card_key: string;
    card_name: string | null;
    numeral: string | null;
    image_url: string | null;
    artwork_path: string | null;
    rendered_url: string | null;
  };

  const [previewByCard, setPreviewByCard] = useState<Record<number, string>>({});

  const hydrateFromSessionCards = useCallback((rows: SessionCardRow[], opts?: { resetSelection?: boolean }) => {
    const nextArtwork: Record<number, string> = {};
    const nextPreview: Record<number, string> = {};
    artworkPathByCardRef.current = {};
    cardFieldsRef.current = {};
    for (const row of rows) {
      const i = parseInt(row.card_key, 10);
      if (Number.isNaN(i) || i < 0 || i > 77) continue;
      if (row.image_url) nextArtwork[i] = row.image_url;
      if (row.artwork_path) artworkPathByCardRef.current[i] = row.artwork_path;
      if (row.rendered_url) nextPreview[i] = row.rendered_url;
      cardFieldsRef.current[i] = {
        cardName: row.card_name ?? '',
        numeral: row.numeral ?? '',
      };
    }
    setArtworkByCard(nextArtwork);
    setPreviewByCard(nextPreview);

    const reset = opts?.resetSelection !== false;
    const idx = reset ? 0 : selectedCardIndexRef.current;
    if (reset) setSelectedCardIndex(0);
    const dSel = getTarotDefault(idx);
    const sSel = cardFieldsRef.current[idx];
    setCardName(sSel?.cardName?.trim() ? sSel.cardName : (dSel?.name ?? ''));
    setCardNumeral(sSel?.numeral ?? dSel?.numeral ?? '');
    setPreviewError(null);
  }, []);

  const loadStudio = useCallback(async () => {
    setSessionError(null);
    const res = await fetch('/api/studio/session', { method: 'GET' });
    if (res.status === 401) {
      setSessionError('Sign in to load your deck.');
      setFlowPhase('setup');
      setDeckId(null);
      return;
    }
    if (!res.ok) {
      setSessionError('Could not load your studio deck.');
      setFlowPhase('setup');
      return;
    }
    const data = (await res.json()) as {
      deck: { id: string; borderSlug: string | null } | null;
      cards: SessionCardRow[];
    };
    const slug = data.deck?.borderSlug?.trim() ?? '';
    if (data.deck?.id && slug) {
      setDeckId(data.deck.id);
      setDeckBorderSlug(slug);
      hydrateFromSessionCards(data.cards, { resetSelection: true });
      setFlowPhase('builder');
    } else {
      setDeckId(data.deck?.id ?? null);
      if (data.deck?.id && data.cards?.length) {
        hydrateFromSessionCards(data.cards, { resetSelection: true });
      }
      setFlowPhase('setup');
    }
  }, [hydrateFromSessionCards]);

  useEffect(() => {
    void loadStudio();
  }, [loadStudio]);

  async function handleStartBuilding() {
    const slug = setupSelectedSlug.trim();
    if (!slug || startingDeck) return;
    setStartingDeck(true);
    setSessionError(null);
    try {
      const res = await fetch('/api/studio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'start', borderSlug: slug }),
      });
      const raw = await res.text();
      let data: { deckId?: string; borderSlug?: string; cards?: SessionCardRow[]; error?: string } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        data = {};
      }
      if (!res.ok) {
        setSessionError(data.error?.trim() || `Could not start deck (${res.status}).`);
        return;
      }
      if (!data.deckId || !data.cards) {
        setSessionError('Invalid response from server.');
        return;
      }
      setDeckId(data.deckId);
      setDeckBorderSlug(data.borderSlug ?? slug);
      hydrateFromSessionCards(data.cards, { resetSelection: true });
      setFlowPhase('builder');
    } finally {
      setStartingDeck(false);
    }
  }

  const persistCardToServer = useCallback(
    async (cardIndex: number, overrides?: { cardName?: string; numeral?: string; artworkPath?: string | null }) => {
      const id = deckId;
      if (!id) return;
      const fields = cardFieldsRef.current[cardIndex] ?? {
        cardName: getTarotDefault(cardIndex)?.name ?? '',
        numeral: getTarotDefault(cardIndex)?.numeral ?? '',
      };
      const name = overrides?.cardName !== undefined ? overrides.cardName : fields.cardName;
      const num = overrides?.numeral !== undefined ? overrides.numeral : fields.numeral;
      const path =
        overrides?.artworkPath !== undefined
          ? overrides.artworkPath
          : artworkPathByCardRef.current[cardIndex] ?? undefined;

      setSaveStatusSaving(true);
      setSaveStatusSaved(false);
      setSaveError(null);
      try {
        const payload: Record<string, unknown> = {
          deckId: id,
          cardKey: String(cardIndex),
          cardName: name,
          numeral: num,
        };
        if (path !== undefined) {
          payload.artworkPath = path;
        }
        const res = await fetch('/api/studio/save-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const raw = await res.text();
        let errMsg: string | undefined;
        try {
          const j = JSON.parse(raw) as { error?: string };
          errMsg = j.error;
        } catch {
          /* non-JSON body */
        }
        if (!res.ok) {
          setSaveStatusSaved(false);
          setSaveError(errMsg?.trim() || `Save failed (${res.status}). Retrying soon…`);
          return;
        }
        setSaveError(null);
        setSaveStatusSaved(true);
      } catch {
        setSaveStatusSaved(false);
        setSaveError('Save failed. Check your connection.');
      } finally {
        setSaveStatusSaving(false);
      }
    },
    [deckId],
  );

  const artworkUrlForSelected = artworkByCard[selectedCardIndex];
  useEffect(() => {
    if (!deckId) return;
    const t = setTimeout(() => {
      void persistCardToServer(selectedCardIndex);
    }, 500);
    return () => clearTimeout(t);
  }, [
    deckId,
    selectedCardIndex,
    cardName,
    cardNumeral,
    artworkUrlForSelected,
    persistCardToServer,
  ]);

  async function selectCard(index: number) {
    const d = getTarotDefault(index);
    if (!d) return;
    if (index === selectedCardIndex) return;
    setUploadError(null);
    if (deckId) {
      cardFieldsRef.current[selectedCardIndex] = { cardName, numeral: cardNumeral };
      await persistCardToServer(selectedCardIndex);
    }
    setSelectedCardIndex(index);
    const saved = cardFieldsRef.current[index];
    setCardName(saved?.cardName?.trim() ? saved.cardName : d.name);
    setCardNumeral(saved?.numeral ?? d.numeral);
    setPreviewError(null);
  }

  const artworkSrc = artworkByCard[selectedCardIndex] ?? null;

  const previewImage = previewByCard[selectedCardIndex] ?? null;
  const [renderLoading, setRenderLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [exportCheckoutKind, setExportCheckoutKind] = useState<null | 'print'>(null);

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
    try {
      setUploading(true);
      setUploadError(null);

      const effectiveDeckId = deckId;
      if (!effectiveDeckId) {
        setUploadError('Choose a deck border and start building before uploading.');
        return;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('deckId', effectiveDeckId);
      form.append('cardIndex', String(selectedCardIndex));

      const uploadRes = await fetch('/api/studio/upload', { method: 'POST', body: form });
      const rawUpload = await uploadRes.text();
      let uploadData: { url?: string; path?: string; error?: string } = {};
      try {
        uploadData = JSON.parse(rawUpload) as typeof uploadData;
      } catch {
        uploadData = {};
      }

      if (!uploadRes.ok || !uploadData.url || !uploadData.path) {
        setUploadError(uploadData.error?.trim() || 'Upload failed. Please try again.');
        return;
      }

      artworkPathByCardRef.current[selectedCardIndex] = uploadData.path;

      setArtworkByCard((prev) => ({
        ...prev,
        [selectedCardIndex]: uploadData.url!,
      }));
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[selectedCardIndex];
        return next;
      });

      cardFieldsRef.current[selectedCardIndex] = { cardName, numeral: cardNumeral };
      setSaveStatusSaving(true);
      setSaveStatusSaved(false);
      setSaveError(null);
      try {
        const saveRes = await fetch('/api/studio/save-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deckId: effectiveDeckId,
            cardKey: String(selectedCardIndex),
            cardName,
            numeral: cardNumeral,
            artworkPath: uploadData.path,
          }),
        });
        const rawSave = await saveRes.text();
        let savePayload: { error?: string } = {};
        try {
          savePayload = JSON.parse(rawSave) as { error?: string };
        } catch {
          savePayload = {};
        }
        if (!saveRes.ok) {
          setSaveStatusSaved(false);
          setSaveError(savePayload.error?.trim() || `Save failed (${saveRes.status}). Retrying soon…`);
        } else {
          setSaveError(null);
          setSaveStatusSaved(true);
        }
      } catch {
        setSaveStatusSaved(false);
        setSaveError('Save failed. Check your connection.');
      } finally {
        setSaveStatusSaving(false);
      }
    } catch (err) {
      console.error('Upload crash:', err);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  async function handleRemoveArtwork() {
    const name = cardName.trim() || getTarotDefault(selectedCardIndex)?.name || 'this card';
    if (!confirm(`Remove artwork for ${name}?`)) return;
    delete artworkPathByCardRef.current[selectedCardIndex];
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
    if (deckId) {
      cardFieldsRef.current[selectedCardIndex] = { cardName, numeral: cardNumeral };
      void persistCardToServer(selectedCardIndex, { artworkPath: null });
    }
  }

  async function saveAndNextCard() {
    if (!artworkSrc) return;
    if (selectedCardIndex >= 77) return;
    const next = selectedCardIndex + 1;
    await selectCard(next);
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

      if (!deckId) {
        alert('Deck session not ready. Wait a moment and try again.');
        return;
      }

      const res = await fetch('/api/studio/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          cardIndex: selectedCardIndex,
          artwork: artworkPayload,
          numeral,
          card_name: cardNameTrimmed,
        }),
      });

      if (res.status === 401) {
        openSignInPrompt();
        setPreviewError(null);
        return;
      }

      let data: { image_url?: string; renderUrl?: string; error?: string; detail?: string };
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

      const previewUrl = data.image_url ?? data.renderUrl;
      if (!res.ok || !previewUrl) {
        setPreviewByCard((prev) => {
          const next = { ...prev };
          delete next[selectedCardIndex];
          return next;
        });
        const msg = [data.error || 'Render failed', data.detail].filter(Boolean).join(' — ');
        alert(msg);
        setPreviewError(data.detail?.trim() || 'Preview failed — check console');
        return;
      }

      setPreviewByCard((prev) => ({ ...prev, [selectedCardIndex]: previewUrl }));
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

  const renderedCount = useMemo(
    () => Object.values(previewByCard).filter((u) => typeof u === 'string' && u.length > 0).length,
    [previewByCard],
  );

  const artworkCount = useMemo(
    () => Object.values(artworkByCard).filter((u) => typeof u === 'string' && u.length > 0).length,
    [artworkByCard],
  );

  const exportUnlocked = useMemo(
    () => exportUnlockedBorderSlugs.includes(deckBorderSlug),
    [exportUnlockedBorderSlugs, deckBorderSlug],
  );

  const currentBorderName = useMemo(
    () => catalog.find((b) => b.slug === deckBorderSlug)?.name ?? 'This border',
    [catalog, deckBorderSlug],
  );

  const borderOverlaySrc = useMemo(() => {
    const b = catalog.find((x) => x.slug === deckBorderSlug) ?? catalog[0];
    return b?.image?.trim() && b.image.trim().length > 0 ? b.image.trim() : FALLBACK_BORDER_IMAGE;
  }, [catalog, deckBorderSlug]);

  const mobileCardSelectValue = String(selectedCardIndex);
  const loginRedirect = `${studioBasePath}${deckBorderSlug ? `?border=${encodeURIComponent(deckBorderSlug)}` : ''}`;

  async function submitChangeBorder(confirmClearRenders: boolean) {
    const slug = changePickSlug.trim();
    if (!slug || changeBorderBusy) return;
    setChangeBorderBusy(true);
    setSessionError(null);
    try {
      const res = await fetch('/api/studio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'changeBorder',
          borderSlug: slug,
          confirmClearRenders,
        }),
      });
      const raw = await res.text();
      let data: {
        deckId?: string;
        borderSlug?: string;
        cards?: SessionCardRow[];
        error?: string;
        message?: string;
        completedRenders?: number;
      } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        data = {};
      }
      if (res.status === 409 && data.error === 'CONFIRM_CLEAR_RENDERS') {
        setForceConfirmClearRenders(true);
        setChangeBorderStep('warn');
        return;
      }
      if (!res.ok) {
        setSessionError(data.error?.trim() || data.message?.trim() || `Could not update border (${res.status}).`);
        return;
      }
      if (!data.deckId || !data.cards) {
        setSessionError('Invalid response from server.');
        return;
      }
      setDeckId(data.deckId);
      setDeckBorderSlug(data.borderSlug ?? slug);
      hydrateFromSessionCards(data.cards, { resetSelection: false });
      setChangeBorderOpen(false);
      setChangeBorderStep('pick');
      setForceConfirmClearRenders(false);
    } finally {
      setChangeBorderBusy(false);
    }
  }

  function openChangeBorder() {
    setChangePickSlug(deckBorderSlug || catalog[0]?.slug || '');
    setForceConfirmClearRenders(false);
    if (renderedCount > 0) {
      setChangeBorderStep('warn');
    } else {
      setChangeBorderStep('pick');
    }
    setChangeBorderOpen(true);
  }

  async function startStudioPrintCheckout() {
    setExportCheckoutKind('print');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'print',
          borderSlug: deckBorderSlug,
          borderName: currentBorderName,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(loginRedirect)}`;
          return;
        }
        alert(data.error || 'Checkout failed');
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setExportCheckoutKind(null);
    }
  }

  if (noBordersInCatalog) {
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
            Your Deck →
          </Link>
        </div>
        <div className="rounded-sm border border-charcoal/15 bg-cream/80 px-5 py-10 text-center">
          <p className="text-sm font-medium text-charcoal">No borders are available yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/70">
            The border catalog is empty. Check back soon or contact support if this persists.
          </p>
          <Link
            href="/borders"
            className="mt-6 inline-flex rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-xs font-medium text-cream hover:bg-charcoal/90"
          >
            Browse borders
          </Link>
        </div>
      </div>
    );
  }

  const setupBorderName =
    catalog.find((b) => b.slug === setupSelectedSlug)?.name ?? setupSelectedSlug ?? 'this border';

  if (flowPhase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-charcoal">Studio</h1>
        <p className="mt-4 text-sm text-charcoal/65">Loading your deck…</p>
      </div>
    );
  }

  if (flowPhase === 'setup') {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-charcoal">Choose your deck border</h1>
            <p className="mt-2 max-w-2xl text-sm text-charcoal/70">
              All 78 cards share one border for a consistent deck. Pick the frame you want before you start uploading
              artwork.
            </p>
          </div>
          <Link
            href={`${studioBasePath}/projects`}
            className="text-sm text-charcoal underline underline-offset-2 hover:no-underline"
          >
            Your Deck →
          </Link>
        </div>
        {sessionError ? (
          <p className="mb-4 text-sm text-red-800/90" role="alert">
            {sessionError}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((b) => {
            const selected = b.slug === setupSelectedSlug;
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => setSetupSelectedSlug(b.slug)}
                className={`group flex flex-col overflow-hidden rounded-sm border bg-cream text-left transition ${
                  selected ? 'border-charcoal ring-2 ring-charcoal/25' : 'border-charcoal/15 hover:border-charcoal/35'
                }`}
              >
                <div className="relative aspect-[2/3] w-full bg-charcoal/5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- dynamic catalog URLs */}
                  <img
                    src={b.image?.trim() ? b.image.trim() : FALLBACK_BORDER_IMAGE}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="border-t border-charcoal/10 px-2 py-2">
                  <p className="text-xs font-medium text-charcoal">{b.name}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!setupSelectedSlug || startingDeck}
            onClick={() => void handleStartBuilding()}
            className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-5 py-3 text-sm font-semibold text-cream hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {startingDeck ? 'Starting…' : 'Start Building Your Deck'}
          </button>
          <p className="text-xs text-charcoal/55">
            Selected: <span className="font-medium text-charcoal">{setupBorderName}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {changeBorderOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/40 p-4 sm:items-center lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-change-border-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-charcoal/15 bg-cream shadow-lg sm:rounded-sm">
            <div className="border-b border-charcoal/10 px-5 py-4">
              <h2 id="studio-change-border-title" className="text-lg font-semibold text-charcoal">
                Change deck border
              </h2>
            </div>
            <div className="px-5 py-4">
              {changeBorderStep === 'warn' ? (
                <div className="space-y-4">
                  <p className="text-sm text-charcoal/80">
                    Changing your border will require all completed cards to be re-rendered with the new border. Your
                    artwork will be kept but renders will be cleared. Are you sure?
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-sm border border-charcoal/30 px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5"
                      onClick={() => {
                        setForceConfirmClearRenders(false);
                        setChangeBorderOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
                      onClick={() => setChangeBorderStep('pick')}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-charcoal/70">Pick a new border for every card in this deck.</p>
                  <div className="grid max-h-[40vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                    {catalog.map((b) => {
                      const selected = b.slug === changePickSlug;
                      return (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => setChangePickSlug(b.slug)}
                          className={`flex flex-col overflow-hidden rounded-sm border text-left ${
                            selected ? 'border-charcoal ring-2 ring-charcoal/20' : 'border-charcoal/15'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={b.image?.trim() ? b.image.trim() : FALLBACK_BORDER_IMAGE}
                            alt=""
                            className="aspect-[2/3] w-full object-cover"
                          />
                          <span className="border-t border-charcoal/10 px-1.5 py-1 text-[10px] font-medium text-charcoal">
                            {b.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {sessionError ? (
                    <p className="text-sm text-red-800/90" role="alert">
                      {sessionError}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-sm border border-charcoal/30 px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5"
                      onClick={() => {
                        setForceConfirmClearRenders(false);
                        setChangeBorderOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={changeBorderBusy || !changePickSlug}
                      onClick={() =>
                        void submitChangeBorder(renderedCount > 0 || forceConfirmClearRenders)
                      }
                      className="rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changeBorderBusy ? 'Updating…' : 'Apply border'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
              Sign in to upload artwork, preview cards, and sync your deck.
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

      {showExportPaywall ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-charcoal/40 lg:items-center lg:justify-center lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-export-choice-title"
        >
          <div className="flex min-h-0 flex-1 flex-col bg-cream lg:min-h-0 lg:max-h-[90vh] lg:max-w-lg lg:flex-none lg:rounded-sm lg:border lg:border-charcoal/15 lg:shadow-lg">
            <div className="flex-1 overflow-y-auto p-6 lg:flex-none">
              <h2 id="studio-export-choice-title" className="text-lg font-semibold text-charcoal">
                What would you like to do next?
              </h2>
              <p className="mt-2 text-sm text-charcoal/70">
                <span className="font-medium text-charcoal">{currentBorderName}</span>
              </p>

              <div className="mt-6 space-y-6">
                <div className="rounded-sm border border-charcoal/10 bg-cream/90 p-4">
                  <p className="text-sm font-medium text-charcoal">🖨️ Print your deck</p>
                  <p className="mt-1 text-sm text-charcoal/75">Get a physical tarot deck shipped to you</p>
                  <button
                    type="button"
                    disabled={exportCheckoutKind !== null}
                    onClick={() => void startStudioPrintCheckout()}
                    className="mt-4 inline-flex w-full justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-3.5 text-center text-sm font-semibold text-cream hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {exportCheckoutKind === 'print' ? 'Redirecting…' : 'Print my deck'}
                  </button>
                </div>

              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 border-t border-charcoal/10 bg-cream px-6 py-4 lg:rounded-b-sm">
              <Link
                href={`/borders/${deckBorderSlug}`}
                className="inline-flex w-full justify-center rounded-sm border border-charcoal/30 bg-transparent px-4 py-3 text-sm text-charcoal hover:bg-charcoal/5"
              >
                View border details
              </Link>
              <button
                type="button"
                className="mt-1 text-center text-sm text-charcoal/60 underline underline-offset-2 hover:text-charcoal"
                onClick={() => setShowExportPaywall(false)}
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
          <p className="mt-1 text-xs text-charcoal/55">
            Preview your deck for free. Pay only when you&apos;re ready to export.
          </p>
          {(saveStatusSaving || saveStatusSaved || saveError) && (
            <p
              className={`mt-1 text-xs ${saveError ? 'text-red-800/90' : 'text-charcoal/55'}`}
              aria-live="polite"
            >
              {saveStatusSaving ? 'Saving...' : saveError ? saveError : 'Saved ✓'}
            </p>
          )}
          <p className="mt-2 text-sm text-charcoal">
            Your border:{' '}
            <span className="font-medium">{currentBorderName}</span>{' '}
            <button
              type="button"
              onClick={() => openChangeBorder()}
              className="text-xs font-normal text-charcoal/70 underline underline-offset-2 hover:text-charcoal"
            >
              Change border
            </button>
          </p>
        </div>
        <Link
          href={`${studioBasePath}/projects`}
          className="text-sm text-charcoal underline underline-offset-2 hover:no-underline"
        >
          Your Deck →
        </Link>
      </div>

      <div className="mb-4 w-full rounded-sm border border-charcoal/10 bg-cream/60 px-4 py-3">
        <p className="text-sm font-medium text-charcoal">
          Card {selectedCardIndex + 1} of 78 — {cardName || getTarotDefault(selectedCardIndex)?.name}
        </p>
        <p className="mt-1 text-xs text-charcoal/60">
          Progress: {renderedCount} / 78 cards with a saved preview render
        </p>
      </div>

      {artworkCount > 0 ? (
        <div className="mb-4 w-full rounded-sm border border-charcoal/10 bg-cream/80 px-4 py-4">
          <h2 className="text-sm font-semibold text-charcoal">Full deck export</h2>
          <p className="mt-1 text-xs text-charcoal/65">
            Preview your deck for free. Pay only when you&apos;re ready to export.
          </p>
          {exportUnlocked ? (
            <p className="mt-2 text-sm text-emerald-900">✓ Export unlocked for {currentBorderName}.</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {!exportUnlocked ? (
              <button
                type="button"
                onClick={() => setShowExportPaywall(true)}
                className="inline-flex rounded-sm border border-charcoal/35 bg-cream px-4 py-2 text-xs font-medium text-charcoal hover:bg-charcoal/5"
              >
                Unlock export
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="mt-5 hidden max-w-2xl border-b border-charcoal/5 pb-5 lg:block" aria-label="About this builder">
        <h2 className="text-xs font-medium uppercase tracking-wide text-charcoal/50">About this builder</h2>
        <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
          This tool lets you create your own tarot deck with a border frame you choose. You are not editing a pre-designed
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
              artworkSrc && !previewImage ? 'overflow-hidden bg-transparent' : 'overflow-hidden bg-cream/90'
            }`}
            style={{ aspectRatio: '2 / 3' }}
          >
            {/* Layering: artwork (z-1) + border PNG (z-2). Native <img> for both so z-index stacks correctly
                (next/image wraps a span; the wrapper stayed z-auto and hid artwork behind an opaque hole). */}
            {artworkSrc && !previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- must stack with border <img>; next/image wrapper breaks z-index
              <img
                src={artworkSrc}
                alt="Uploaded tarot artwork preview in the card frame"
                className="absolute left-0 top-0 z-[1] h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : null}

            {!previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- must stack with artwork <img>; next/image wrapper breaks z-index
              <img
                src={borderOverlaySrc}
                alt="Border overlay"
                className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-full object-contain"
              />
            ) : null}

            {/* Layer 3: brief “lifted” duplicate so upload success is obvious before Preview Card */}
            {artworkSrc && !previewImage ? (
              <div
                className="pointer-events-none absolute left-0 top-0 z-[3] flex h-full w-full items-center justify-center p-1"
                aria-hidden
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- duplicate layer for upload confirmation */}
                <img
                  src={artworkSrc}
                  alt=""
                  className="h-full w-full max-h-full max-w-full origin-center object-cover shadow-lg ring-1 ring-charcoal/20 scale-[0.97]"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            {previewImage ? (
              <div className="absolute inset-0 z-[20] h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed / templated URL; must fill container */}
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

            {!artworkSrc ? (
              <>
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-cream/80 px-3 text-center sm:px-4">
                  <p className="max-w-[16rem] text-[11px] leading-snug text-charcoal/60 sm:text-xs">
                    Upload your artwork to begin designing this card
                  </p>
                  <p className="mt-1.5 text-[10px] text-charcoal/50 sm:text-xs">PNG or JPG recommended</p>
                  {uploadError ? (
                    <p className="pointer-events-auto mt-3 max-w-[18rem] text-[11px] font-medium leading-snug text-red-800 sm:text-xs" role="alert">
                      {uploadError}
                    </p>
                  ) : null}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="absolute inset-0 z-[25] cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  onChange={(e) => {
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
          {artworkSrc && !previewImage ? (
            <p
              className="mx-auto mt-2 max-w-sm px-2 text-center text-[10px] font-medium leading-snug text-emerald-900/90 sm:text-[11px]"
              role="status"
            >
              ✓ Artwork ready — click Preview Card
            </p>
          ) : null}
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
                  onClick={() => void saveAndNextCard()}
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
                    const done = Boolean(previewByCard[card.index]);
                    const active = selectedCardIndex === card.index;
                    return (
                      <li key={card.index}>
                        <button
                          type="button"
                          data-studio-card-index={card.index}
                          onClick={() => selectCard(card.index)}
                          aria-current={active ? 'true' : undefined}
                          aria-label={`${card.name}${done ? ', preview render saved' : ', no preview render yet'}`}
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
                      const done = Boolean(previewByCard[card.index]);
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
