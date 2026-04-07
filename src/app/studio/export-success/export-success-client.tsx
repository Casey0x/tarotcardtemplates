'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ROTATING_MESSAGES = [
  'Gathering your cards…',
  'Packaging your artwork…',
  'Almost ready…',
  'Preparing your download…',
] as const;

const GENERIC_PACKAGING_ERROR =
  'Something went wrong packaging your deck. Please try Download again.';

type Phase = 'loading' | 'success' | 'error';

class ExportZipError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ExportZipError';
    this.code = code;
  }
}

async function fetchExportZip(downloadUrl: string): Promise<void> {
  const res = await fetch(downloadUrl, { credentials: 'include' });

  if (!res.ok) {
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      try {
        const j = (await res.json()) as { error?: string; code?: string };
        const msg = j.error ?? `Request failed (${res.status})`;
        throw new ExportZipError(msg, j.code);
      } catch (e) {
        if (e instanceof ExportZipError) throw e;
      }
    }
    throw new ExportZipError(GENERIC_PACKAGING_ERROR);
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
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    if (phase !== 'loading') return;
    const id = window.setInterval(() => {
      setRotatingIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [phase]);

  const triggerDownload = useCallback(async () => {
    setMessage(null);
    setPhase('loading');
    try {
      await fetchExportZip(downloadUrl);
      setPhase('success');
    } catch (e) {
      setPhase('error');
      if (e instanceof ExportZipError) {
        setMessage(e.message);
      } else {
        setMessage(e instanceof Error ? e.message : GENERIC_PACKAGING_ERROR);
      }
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
        if (!cancelled) setPhase('success');
      } catch (e) {
        if (!cancelled) {
          setPhase('error');
          if (e instanceof ExportZipError) {
            setMessage(e.message);
          } else {
            setMessage(e instanceof Error ? e.message : GENERIC_PACKAGING_ERROR);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, deckId, exportType, downloadUrl]);

  const errorText =
    phase === 'error'
      ? message?.includes('Missing session')
        ? message
        : message?.includes('longer than expected')
          ? message
          : message && message.length > 0
            ? message
            : GENERIC_PACKAGING_ERROR
      : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-charcoal">Studio export</h1>

      {phase === 'loading' ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-9 w-9 shrink-0 animate-spin rounded-full border-2 border-charcoal/25 border-t-charcoal"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-charcoal">{ROTATING_MESSAGES[rotatingIndex]}</p>
              <p className="mt-1 text-xs text-charcoal/65">This usually takes 10–20 seconds.</p>
            </div>
          </div>
        </div>
      ) : null}

      {phase === 'success' ? (
        <div className="mt-6 space-y-3">
          <div
            className="check-pop flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-800"
            role="img"
            aria-label="Success"
          >
            ✅
          </div>
          <p className="text-sm font-medium text-emerald-900">Your deck is ready!</p>
          <p className="text-sm text-charcoal/75">
            Your download should start automatically. If it didn&apos;t, use the button below.
          </p>
        </div>
      ) : null}

      {phase === 'error' && errorText ? (
        <p className="mt-6 text-sm text-red-800/90" role="alert">
          {errorText}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          disabled={phase === 'loading'}
          onClick={() => void triggerDownload()}
          className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {phase === 'loading' ? 'Preparing…' : 'Download again'}
        </button>
        <Link
          href="/studio-beta"
          className="inline-flex justify-center rounded-sm border border-charcoal/30 px-4 py-2 text-center text-sm text-charcoal hover:bg-charcoal/5"
        >
          Return to Studio
        </Link>
      </div>

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .check-pop {
          animation: pop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
