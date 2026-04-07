'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Phase = 'loading' | 'ready' | 'error';

async function fetchExportZip(downloadUrl: string): Promise<void> {
  const res = await fetch(downloadUrl, { credentials: 'include' });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string; detail?: string };
      detail = j.error || j.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
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
}

export function StudioExportSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id')?.trim() ?? '';
  const deckId = searchParams.get('deck_id')?.trim() ?? '';
  const exportType = searchParams.get('export_type')?.trim() ?? '';

  const downloadUrl = useMemo(
    () =>
      `/api/studio/export-verify?session_id=${encodeURIComponent(sessionId)}&deck_id=${encodeURIComponent(deckId)}&export_type=${encodeURIComponent(exportType)}`,
    [sessionId, deckId, exportType],
  );

  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState<string | null>(null);

  const triggerDownload = useCallback(async () => {
    setMessage(null);
    try {
      await fetchExportZip(downloadUrl);
      setPhase('ready');
    } catch (e) {
      setPhase('error');
      setMessage(e instanceof Error ? e.message : 'Download failed');
    }
  }, [downloadUrl]);

  useEffect(() => {
    if (!sessionId || !deckId || !exportType) {
      setPhase('error');
      setMessage('Missing session, deck, or export type in the URL.');
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await fetchExportZip(downloadUrl);
        if (!cancelled) setPhase('ready');
      } catch (e) {
        if (!cancelled) {
          setPhase('error');
          setMessage(e instanceof Error ? e.message : 'Download failed');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, deckId, exportType, downloadUrl]);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-charcoal">Studio export</h1>
      {phase === 'loading' ? (
        <p className="mt-4 text-sm text-charcoal/75">Preparing your deck for download…</p>
      ) : null}
      {phase === 'ready' ? (
        <p className="mt-4 text-sm text-emerald-900">
          Your ZIP should start downloading. If it didn&apos;t, use the button below.
        </p>
      ) : null}
      {phase === 'error' ? (
        <p className="mt-4 text-sm text-red-800/90" role="alert">
          {message ?? 'Something went wrong.'}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void triggerDownload()}
          className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
        >
          Download again
        </button>
        <Link
          href="/studio-beta"
          className="inline-flex justify-center rounded-sm border border-charcoal/30 px-4 py-2 text-center text-sm text-charcoal hover:bg-charcoal/5"
        >
          Return to Studio
        </Link>
      </div>
    </div>
  );
}
