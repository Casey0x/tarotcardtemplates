'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import type { StudioPreviewItem } from '@/lib/studio-border-options';
import { createClient } from '@/lib/supabase-client';
import { StudioArtworkPicker } from '@/components/studio-artwork-picker';
import { studioDownloadSubtitle } from '@/lib/studio-download-label';
import { getTarotDefault, TAROT_CARDS_78, TAROT_SECTIONS } from '@/lib/tarot-cards';

export type { StudioPreviewItem } from '@/lib/studio-border-options';

/** Must match sidebar / mobile select: truthy `previewByCard[index]` means a saved render exists. */
function hasSavedPreviewRender(previewByCard: Record<number, string>, index: number): boolean {
  return Boolean(previewByCard[index]);
}

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

function StudioVisualPreviewInner({
  borders,
  borderCatalog,
  studioBasePath = '/studio',
  initialBorderSlug,
  exportUnlockedBorderSlugs = [],
  noBordersInCatalog = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const cardUploadInputRef = useRef<HTMLInputElement>(null);
  const [borderRerenderProgress, setBorderRerenderProgress] = useState<null | { current: number; total: number }>(
    null,
  );
  const [borderRerenderSuccess, setBorderRerenderSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showRenderSuccessFlash, setShowRenderSuccessFlash] = useState(false);

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
  /** `studio_artwork.id` for the image assigned to each card (when using the library upload flow). */
  const artworkIdByCardRef = useRef<Record<number, string>>({});
  const selectedCardIndexRef = useRef(0);
  /** Blocks duplicate handling for the same deck + ?border= pair (Try in Studio). */
  const urlBorderAttemptRef = useRef<string | null>(null);
  const prevDeckBorderSlugRef = useRef<string | null>(null);
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
    artwork_id?: string | null;
    rendered_url: string | null;
  };

  const [previewByCard, setPreviewByCard] = useState<Record<number, string>>({});

  const hydrateFromSessionCards = useCallback(
    (rows: SessionCardRow[], opts?: { resetSelection?: boolean; skipRenderedPreviews?: boolean }) => {
    const nextArtwork: Record<number, string> = {};
    const nextPreview: Record<number, string> = {};
    artworkPathByCardRef.current = {};
    artworkIdByCardRef.current = {};
    cardFieldsRef.current = {};
    for (const row of rows) {
      const i = parseInt(row.card_key, 10);
      if (Number.isNaN(i) || i < 0 || i > 77) continue;
      if (row.image_url) nextArtwork[i] = row.image_url;
      if (row.artwork_path) artworkPathByCardRef.current[i] = row.artwork_path;
      if (row.artwork_id && String(row.artwork_id).trim()) {
        artworkIdByCardRef.current[i] = String(row.artwork_id).trim();
      }
      if (row.rendered_url && !opts?.skipRenderedPreviews) nextPreview[i] = row.rendered_url;
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
  },
    [],
  );

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
    async (
      cardIndex: number,
      overrides?: { cardName?: string; numeral?: string; artworkPath?: string | null; artworkId?: string | null },
    ) => {
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
        const artId =
          overrides?.artworkId !== undefined ? overrides.artworkId : artworkIdByCardRef.current[cardIndex];
        if (artId !== undefined) {
          payload.artworkId = artId;
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

  useEffect(() => {
    if (deckBorderSlug) prevDeckBorderSlugRef.current = deckBorderSlug;
  }, [deckBorderSlug]);

  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [exportCheckoutKind, setExportCheckoutKind] = useState<null | 'print'>(null);
  const [deckDownloadBusy, setDeckDownloadBusy] = useState(false);
  const [downloadRotateIndex, setDownloadRotateIndex] = useState(0);
  const [showPrintUpsell, setShowPrintUpsell] = useState(false);

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

  const openSignInPrompt = useCallback(() => setShowSignInPrompt(true), []);

  function findNextIncompleteCardIndex(fromIndex: number, previews: Record<number, string>): number {
    for (let step = 1; step < 78; step++) {
      const idx = (fromIndex + step) % 78;
      if (!hasSavedPreviewRender(previews, idx)) return idx;
    }
    return fromIndex;
  }

  const renderCardWithArtwork = useCallback(
    async (
      cardIndex: number,
      artwork: string,
      card_name: string,
      numeral: string,
      opts?: { manageLoading?: boolean },
    ): Promise<string | null> => {
      const id = deckId;
      const manageLoading = opts?.manageLoading !== false;
      if (!id) return null;
      const cardNameTrimmed = card_name.trim();
      if (!cardNameTrimmed) {
        if (manageLoading) alert('Add a card name before rendering.');
        return null;
      }
      if (manageLoading) {
        setRenderLoading(true);
        setPreviewError(null);
      }
      try {
        let artworkPayload = artwork;
        if (artwork.startsWith('blob:')) {
          artworkPayload = await blobUrlToDataUrl(artwork);
        }
        const aid = artworkIdByCardRef.current[cardIndex]?.trim();
        const res = await fetch('/api/studio/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deckId: id,
            cardIndex,
            artwork: artworkPayload,
            numeral,
            card_name: cardNameTrimmed,
            ...(aid ? { artworkId: aid } : {}),
          }),
        });
        if (res.status === 401) {
          openSignInPrompt();
          return null;
        }
        let data: { image_url?: string; renderUrl?: string; error?: string; detail?: string };
        try {
          data = (await res.json()) as typeof data;
        } catch {
          if (manageLoading) setPreviewError('Render failed — check console');
          return null;
        }
        const previewUrl = data.image_url ?? data.renderUrl;
        if (!res.ok || !previewUrl) {
          if (manageLoading) {
            setPreviewByCard((prev) => {
              const next = { ...prev };
              delete next[cardIndex];
              return next;
            });
            const msg = [data.error || 'Render failed', data.detail].filter(Boolean).join(' — ');
            alert(msg);
            setPreviewError(data.detail?.trim() || 'Render failed');
          }
          return null;
        }
        setPreviewByCard((prev) => ({ ...prev, [cardIndex]: previewUrl }));
        cardFieldsRef.current[cardIndex] = { cardName: card_name, numeral };
        if (manageLoading) setPreviewError(null);
        return previewUrl;
      } catch {
        if (manageLoading) {
          setPreviewByCard((prev) => {
            const next = { ...prev };
            delete next[cardIndex];
            return next;
          });
          setPreviewError('Render failed — check console');
        }
        return null;
      } finally {
        if (manageLoading) setRenderLoading(false);
      }
    },
    [deckId, openSignInPrompt],
  );

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);

      const effectiveDeckId = deckId;
      if (!effectiveDeckId) {
        setUploadError('Choose a deck border and start building before uploading.');
        return;
      }

      const cardIndex = selectedCardIndexRef.current;

      const form = new FormData();
      form.append('file', file);
      form.append('deckId', effectiveDeckId);
      form.append('cardIndex', String(cardIndex));

      const uploadRes = await fetch('/api/studio/upload', { method: 'POST', body: form });
      const rawUpload = await uploadRes.text();
      let uploadData: { url?: string; path?: string; artworkId?: string; error?: string } = {};
      try {
        uploadData = JSON.parse(rawUpload) as typeof uploadData;
      } catch {
        uploadData = {};
      }

      if (!uploadRes.ok || !uploadData.url || !uploadData.path) {
        setUploadError(uploadData.error?.trim() || 'Upload failed. Please try again.');
        return;
      }

      artworkPathByCardRef.current[cardIndex] = uploadData.path;
      if (uploadData.artworkId) {
        artworkIdByCardRef.current[cardIndex] = uploadData.artworkId;
      }

      setArtworkByCard((prev) => ({
        ...prev,
        [cardIndex]: uploadData.url!,
      }));
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[cardIndex];
        return next;
      });

      const fields = cardFieldsRef.current[cardIndex] ?? {
        cardName: getTarotDefault(cardIndex)?.name ?? '',
        numeral: getTarotDefault(cardIndex)?.numeral ?? '',
      };
      cardFieldsRef.current[cardIndex] = fields;

      setSaveStatusSaving(true);
      setSaveStatusSaved(false);
      setSaveError(null);
      try {
        const saveRes = await fetch('/api/studio/save-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deckId: effectiveDeckId,
            cardKey: String(cardIndex),
            cardName: fields.cardName,
            numeral: fields.numeral,
            artworkPath: uploadData.path,
            artworkId: uploadData.artworkId ?? null,
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
          return;
        }
        setSaveError(null);
        setSaveStatusSaved(true);
      } catch {
        setSaveStatusSaved(false);
        setSaveError('Save failed. Check your connection.');
        return;
      } finally {
        setSaveStatusSaving(false);
      }

      const previewUrl = await renderCardWithArtwork(
        cardIndex,
        uploadData.url,
        fields.cardName,
        fields.numeral,
        { manageLoading: true },
      );

      if (previewUrl) {
        setShowRenderSuccessFlash(true);
        window.setTimeout(() => setShowRenderSuccessFlash(false), 900);
        let nextIdx = cardIndex;
        setPreviewByCard((prev) => {
          const merged = { ...prev, [cardIndex]: previewUrl };
          nextIdx = findNextIncompleteCardIndex(cardIndex, merged);
          return merged;
        });
        window.setTimeout(() => {
          void selectCard(nextIdx);
          requestAnimationFrame(() => {
            document
              .querySelector(`.studio-card-nav [data-studio-card-index="${nextIdx}"]`)
              ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
        }, 1500);
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
    delete artworkIdByCardRef.current[selectedCardIndex];
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
      void persistCardToServer(selectedCardIndex, { artworkPath: null, artworkId: null });
    }
  }

  const runBorderRerenders = useCallback(
    async (rows: SessionCardRow[]) => {
      const targets: { index: number; artwork: string; card_name: string; numeral: string }[] = [];
      for (const row of rows) {
        const i = parseInt(row.card_key, 10);
        if (Number.isNaN(i) || i < 0 || i > 77) continue;
        if (!row.image_url) continue;
        const d = getTarotDefault(i);
        const card_name = row.card_name?.trim() ? row.card_name : d?.name ?? '';
        const numeral = row.numeral ?? d?.numeral ?? '';
        targets.push({ index: i, artwork: row.image_url, card_name, numeral });
      }

      if (targets.length === 0) {
        setBorderRerenderSuccess(true);
        window.setTimeout(() => setBorderRerenderSuccess(false), 6000);
        return;
      }

      for (let t = 0; t < targets.length; t++) {
        setBorderRerenderProgress({ current: t + 1, total: targets.length });
        const { index, artwork, card_name, numeral } = targets[t];
        await renderCardWithArtwork(index, artwork, card_name, numeral, { manageLoading: false });
      }

      setBorderRerenderProgress(null);
      setBorderRerenderSuccess(true);
      window.setTimeout(() => setBorderRerenderSuccess(false), 6000);
    },
    [renderCardWithArtwork],
  );

  const renderedCount = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 78; i++) {
      if (hasSavedPreviewRender(previewByCard, i)) n++;
    }
    return n;
  }, [previewByCard]);

  const majorArcanaComplete = useMemo(() => {
    for (let i = 0; i <= 21; i++) {
      if (!hasSavedPreviewRender(previewByCard, i)) return false;
    }
    return true;
  }, [previewByCard]);

  const wandsComplete = useMemo(() => {
    for (let i = 22; i <= 35; i++) {
      if (!hasSavedPreviewRender(previewByCard, i)) return false;
    }
    return true;
  }, [previewByCard]);

  const cupsComplete = useMemo(() => {
    for (let i = 36; i <= 49; i++) {
      if (!hasSavedPreviewRender(previewByCard, i)) return false;
    }
    return true;
  }, [previewByCard]);

  const swordsComplete = useMemo(() => {
    for (let i = 50; i <= 63; i++) {
      if (!hasSavedPreviewRender(previewByCard, i)) return false;
    }
    return true;
  }, [previewByCard]);

  const pentaclesComplete = useMemo(() => {
    for (let i = 64; i <= 77; i++) {
      if (!hasSavedPreviewRender(previewByCard, i)) return false;
    }
    return true;
  }, [previewByCard]);

  const fullDeckComplete = useMemo(() => renderedCount === 78, [renderedCount]);

  const downloadSubtitle = useMemo(
    () =>
      studioDownloadSubtitle({
        renderedCount,
        majorArcanaComplete,
        wandsComplete,
        cupsComplete,
        swordsComplete,
        pentaclesComplete,
        fullDeckComplete,
      }),
    [
      renderedCount,
      majorArcanaComplete,
      wandsComplete,
      cupsComplete,
      swordsComplete,
      pentaclesComplete,
      fullDeckComplete,
    ],
  );

  useEffect(() => {
    if (!deckDownloadBusy) return;
    const id = window.setInterval(() => {
      setDownloadRotateIndex((i) => (i + 1) % 4);
    }, 2500);
    return () => window.clearInterval(id);
  }, [deckDownloadBusy]);

  useEffect(() => {
    const q = searchParams.get('border')?.trim() ?? '';
    if (flowPhase !== 'builder' || !deckId || !deckBorderSlug) return;

    if (!q) {
      urlBorderAttemptRef.current = null;
      return;
    }

    if (!catalog.some((b) => b.slug === q)) return;
    if (q === deckBorderSlug) {
      urlBorderAttemptRef.current = null;
      return;
    }

    const key = `${deckId}:${q}`;
    if (urlBorderAttemptRef.current === key) return;
    urlBorderAttemptRef.current = key;

    const hasRender = renderedCount > 0;

    void (async () => {
      try {
        if (!hasRender) {
          const res = await fetch('/api/studio/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intent: 'changeBorder',
              borderSlug: q,
              confirmClearRenders: false,
            }),
          });
          const raw = await res.text();
          let data: {
            deckId?: string;
            borderSlug?: string;
            cards?: SessionCardRow[];
            error?: string;
          } = {};
          try {
            data = JSON.parse(raw) as typeof data;
          } catch {
            data = {};
          }
          if (!res.ok) {
            urlBorderAttemptRef.current = null;
            setSessionError(data.error?.trim() || `Could not match border from link (${res.status}).`);
            return;
          }
          if (!data.deckId || !data.cards) {
            urlBorderAttemptRef.current = null;
            setSessionError('Invalid response from server.');
            return;
          }
          setDeckId(data.deckId);
          setDeckBorderSlug(data.borderSlug ?? q);
          hydrateFromSessionCards(data.cards, { resetSelection: false, skipRenderedPreviews: true });
          router.replace(studioBasePath, { scroll: false });
          urlBorderAttemptRef.current = null;
          void runBorderRerenders(data.cards);
          return;
        }

        setChangePickSlug(q);
        setChangeBorderStep('warn');
        setForceConfirmClearRenders(true);
        setChangeBorderOpen(true);
      } catch {
        urlBorderAttemptRef.current = null;
      }
    })();
  }, [
    flowPhase,
    deckId,
    deckBorderSlug,
    renderedCount,
    searchParams,
    catalog,
    hydrateFromSessionCards,
    router,
    studioBasePath,
    runBorderRerenders,
  ]);

  const currentBorderName = useMemo(
    () => catalog.find((b) => b.slug === deckBorderSlug)?.name ?? 'This border',
    [catalog, deckBorderSlug],
  );

  const borderOverlaySrc = useMemo(() => {
    const b = catalog.find((x) => x.slug === deckBorderSlug) ?? catalog[0];
    const transparent = b?.transparentImage?.trim();
    const solid = b?.image?.trim();
    /** Full composited border PNGs often include title/numeral artwork; show transparent frame until Templated render. */
    if (!previewImage && transparent) return transparent;
    return solid && solid.length > 0 ? solid : FALLBACK_BORDER_IMAGE;
  }, [catalog, deckBorderSlug, previewImage]);

  const mobileCardSelectValue = String(selectedCardIndex);
  const loginRedirect = `${studioBasePath}${deckBorderSlug ? `?border=${encodeURIComponent(deckBorderSlug)}` : ''}`;

  const DOWNLOAD_ROTATING = [
    'Gathering your cards…',
    'Packaging your artwork…',
    'Almost ready…',
    'Preparing your download…',
  ] as const;

  async function applyLibraryArtwork(artworkId: string) {
    const id = deckId;
    if (!id) return;
    const cardIndex = selectedCardIndexRef.current;
    const fields = cardFieldsRef.current[cardIndex] ?? {
      cardName: getTarotDefault(cardIndex)?.name ?? '',
      numeral: getTarotDefault(cardIndex)?.numeral ?? '',
    };
    setUploadError(null);
    try {
      const res = await fetch('/api/studio/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: id,
          cardKey: String(cardIndex),
          cardName: fields.cardName,
          numeral: fields.numeral,
          artworkId,
        }),
      });
      const raw = await res.text();
      let j: {
        ok?: boolean;
        image_url?: string | null;
        artwork_path?: string | null;
        error?: string;
      } = {};
      try {
        j = JSON.parse(raw) as typeof j;
      } catch {
        j = {};
      }
      if (!res.ok) {
        setUploadError(j.error?.trim() || 'Could not assign artwork');
        return;
      }
      const url = j.image_url?.trim() ?? '';
      if (j.artwork_path) {
        artworkPathByCardRef.current[cardIndex] = j.artwork_path;
      }
      artworkIdByCardRef.current[cardIndex] = artworkId;
      if (url) {
        setArtworkByCard((prev) => ({ ...prev, [cardIndex]: url }));
      }
      setPreviewByCard((prev) => {
        const next = { ...prev };
        delete next[cardIndex];
        return next;
      });
      if (!url) {
        setUploadError('No image URL returned');
        return;
      }
      await renderCardWithArtwork(cardIndex, url, fields.cardName, fields.numeral, { manageLoading: true });
    } catch {
      setUploadError('Could not assign artwork');
    }
  }

  async function downloadDeckZip() {
    const id = deckId;
    if (!id || renderedCount < 1) return;
    setDeckDownloadBusy(true);
    setDownloadRotateIndex(0);
    setShowPrintUpsell(false);
    try {
      const res = await fetch(`/api/studio/export-download?deck_id=${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(loginRedirect)}`;
        return;
      }
      if (!res.ok) {
        let msg = `Download failed (${res.status})`;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        alert(msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tarot-deck.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShowPrintUpsell(true);
    } catch {
      alert('Download failed. Check your connection.');
    } finally {
      setDeckDownloadBusy(false);
    }
  }

  function dismissChangeBorderModal() {
    setForceConfirmClearRenders(false);
    setChangeBorderOpen(false);
    if (searchParams.get('border')) {
      urlBorderAttemptRef.current = null;
      router.replace(studioBasePath, { scroll: false });
    }
  }

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
        needsConfirm?: boolean;
      } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        data = {};
      }
      if (
        (res.ok && data.needsConfirm && data.error === 'CONFIRM_CLEAR_RENDERS') ||
        (res.status === 409 && data.error === 'CONFIRM_CLEAR_RENDERS')
      ) {
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
      hydrateFromSessionCards(data.cards, { resetSelection: false, skipRenderedPreviews: true });
      setChangeBorderOpen(false);
      setChangeBorderStep('pick');
      setForceConfirmClearRenders(false);
      urlBorderAttemptRef.current = null;
      if (searchParams.get('border')) {
        router.replace(studioBasePath, { scroll: false });
      }
      void runBorderRerenders(data.cards);
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
                    Changing your border will re-render every card that has artwork using the new frame. Your original
                    uploads stay in place. This can take a minute for larger decks.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-sm border border-charcoal/30 px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5"
                      onClick={() => dismissChangeBorderModal()}
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
                      onClick={() => dismissChangeBorderModal()}
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

      {borderRerenderProgress ? (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-charcoal/50 p-4"
          role="alertdialog"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-md rounded-sm border border-charcoal/15 bg-cream p-6 shadow-lg">
            <p className="text-sm font-semibold text-charcoal">Re-rendering all cards with new border…</p>
            <p className="mt-2 text-xs text-charcoal/70">
              {borderRerenderProgress.current} / {borderRerenderProgress.total} cards
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-charcoal/10">
              <div
                className="h-full bg-charcoal transition-[width] duration-300"
                style={{
                  width: `${borderRerenderProgress.total > 0 ? (borderRerenderProgress.current / borderRerenderProgress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {borderRerenderSuccess ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[75] max-w-sm -translate-x-1/2 rounded-sm border border-emerald-800/25 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-950 shadow-lg">
          All cards updated with new border!
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
            <p className="mt-2 text-sm text-charcoal/75">Sign in to upload artwork and sync your deck.</p>
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
            Upload artwork, render with your border, and download your deck as a ZIP — free.
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

      {flowPhase === 'builder' && renderedCount > 0 ? (
        <div className="mb-4 w-full rounded-sm border border-emerald-800/20 bg-emerald-50/90 px-4 py-4">
          <p className="text-sm font-semibold text-charcoal">Download my deck</p>
          <p className="mt-1 text-xs text-charcoal/70">{downloadSubtitle}</p>
          <p className="mt-1 text-xs text-charcoal/55">This usually takes 10–20 seconds.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={deckDownloadBusy}
              onClick={() => void downloadDeckZip()}
              className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-2.5 text-xs font-semibold text-cream hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deckDownloadBusy ? DOWNLOAD_ROTATING[downloadRotateIndex % DOWNLOAD_ROTATING.length] : 'Download ZIP'}
            </button>
          </div>
        </div>
      ) : null}

      {flowPhase === 'builder' && showPrintUpsell ? (
        <div className="mb-4 w-full rounded-sm border border-charcoal/15 bg-cream/90 px-4 py-4">
          <p className="text-sm font-semibold text-charcoal">Love your deck?</p>
          <p className="mt-1 text-xs text-charcoal/70">
            Get it professionally printed from NZ$39.95 — order a printed deck when you&apos;re ready.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowExportPaywall(true)}
              className="inline-flex rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-xs font-semibold text-cream hover:bg-charcoal/90"
            >
              Order printed deck →
            </button>
            <button
              type="button"
              onClick={() => setShowPrintUpsell(false)}
              className="inline-flex rounded-sm border border-charcoal/25 px-4 py-2 text-xs text-charcoal hover:bg-charcoal/5"
            >
              Dismiss
            </button>
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

        {/* mobile order 2 / desktop col 2 — card preview + drag-drop */}
        <div className="flex flex-col items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <input
            ref={cardUploadInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = '';
            }}
          />

          <div
            key={deckBorderSlug || 'deck'}
            className={`relative w-full max-w-[280px] rounded-sm border border-charcoal/10 sm:max-w-sm lg:max-w-sm ${
              dragActive ? 'ring-2 ring-charcoal/35' : ''
            } overflow-hidden bg-cream/90`}
            style={{ aspectRatio: '2 / 3' }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file?.type.startsWith('image/')) void handleUpload(file);
            }}
          >
            {previewImage ? (
              <div className="absolute inset-0 z-[30] h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Rendered card"
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
                {showRenderSuccessFlash ? (
                  <div
                    className="studio-success-check pointer-events-none absolute inset-0 z-[31] flex items-center justify-center bg-charcoal/20"
                    aria-hidden
                  >
                    <span className="text-4xl drop-shadow-md">✅</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={borderOverlaySrc}
                alt=""
                className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-full object-contain"
              />
            ) : null}

            {!previewImage && (uploading || renderLoading) ? (
              <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center bg-charcoal/40 px-3 text-center">
                <span
                  className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-cream/30 border-t-cream"
                  aria-hidden
                />
                <p className="mt-3 text-xs font-medium text-cream">
                  {uploading ? 'Uploading…' : 'Rendering your card…'}
                </p>
              </div>
            ) : null}

            {!previewImage && !uploading && !renderLoading ? (
              <button
                type="button"
                disabled={uploading || renderLoading}
                className="absolute inset-0 z-[25] flex cursor-pointer flex-col items-center justify-center bg-cream/65 px-3 text-center outline-none ring-offset-2 transition hover:bg-cream/80 focus-visible:ring-2 focus-visible:ring-charcoal disabled:cursor-not-allowed"
                onClick={() => cardUploadInputRef.current?.click()}
              >
                <span className="pointer-events-none max-w-[15rem] text-[11px] font-medium leading-snug text-charcoal/80 sm:text-xs">
                  Drop your artwork here or click to upload
                </span>
                <span className="pointer-events-none mt-1.5 text-[10px] text-charcoal/50">PNG or JPG recommended</span>
              </button>
            ) : null}

            {uploadError ? (
              <p
                className="absolute bottom-1 left-2 right-2 z-[45] text-center text-[10px] font-medium leading-snug text-red-900 sm:text-[11px]"
                role="alert"
              >
                {uploadError}
              </p>
            ) : null}
          </div>

          {previewImage ? (
            <button
              type="button"
              className="mt-3 text-xs text-charcoal underline underline-offset-2 hover:no-underline disabled:opacity-50"
              disabled={uploading || renderLoading}
              onClick={() => cardUploadInputRef.current?.click()}
            >
              Replace artwork
            </button>
          ) : null}

          {previewError ? (
            <p className="mt-3 max-w-sm text-center text-xs text-red-800/90" role="alert">
              {previewError}
            </p>
          ) : null}

          <style jsx>{`
            .studio-success-check {
              animation: studioSuccessFade 0.9s ease forwards;
            }
            @keyframes studioSuccessFade {
              0%,
              65% {
                opacity: 1;
              }
              100% {
                opacity: 0;
              }
            }
          `}</style>
        </div>

        {/* mobile order 3 / desktop col 3 row 2 */}
        <div className="space-y-4 lg:col-start-3 lg:row-start-2">
          <div className="space-y-4 rounded-sm border border-charcoal/10 bg-cream/80 p-4 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="border-t border-charcoal/10 pt-4 first:mt-0 first:border-t-0 first:pt-0 lg:mt-0 lg:border-t lg:pt-4">
              {artworkSrc ? (
                <button
                  type="button"
                  disabled={uploading || renderLoading}
                  onClick={() => void handleRemoveArtwork()}
                  className="text-xs text-red-700/80 underline decoration-red-700/40 underline-offset-2 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove artwork
                </button>
              ) : null}
            </div>

            {deckId ? (
              <StudioArtworkPicker
                disabled={uploading || renderLoading}
                onPick={(aid) => void applyLibraryArtwork(aid)}
              />
            ) : null}

            <div className="sticky bottom-0 z-30 -mx-1 border-t border-charcoal/10 bg-cream/95 px-1 py-3 backdrop-blur-sm lg:static lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              {renderedCount > 0 ? (
                <button
                  type="button"
                  disabled={deckDownloadBusy}
                  onClick={() => void downloadDeckZip()}
                  className="w-full rounded-sm border border-charcoal/30 bg-transparent px-3 py-2 text-xs font-medium text-charcoal transition hover:bg-charcoal/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deckDownloadBusy ? 'Preparing ZIP…' : 'Download my deck (ZIP)'}
                </button>
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
                    const done = hasSavedPreviewRender(previewByCard, card.index);
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
                      const done = hasSavedPreviewRender(previewByCard, card.index);
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

export function StudioVisualPreview(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-6 py-16">
          <h1 className="text-2xl font-semibold text-charcoal">Studio</h1>
          <p className="mt-4 text-sm text-charcoal/65">Loading Studio…</p>
        </div>
      }
    >
      <StudioVisualPreviewInner {...props} />
    </Suspense>
  );
}
