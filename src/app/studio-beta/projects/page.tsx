'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { createClient } from '@/lib/supabase-client';

interface DeckRow {
  id: string;
  border_name: string;
  total_cards: number;
  completed_cards: number;
  status: string;
  created_at: string;
}

interface StudioDeckRow {
  id: string;
  border_slug: string;
  updated_at: string;
}

function studioBorderDisplayName(slug: string): string {
  return BORDER_TEMPLATES.find((b) => b.slug === slug)?.name ?? slug;
}

function StudioBetaProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [studioDecks, setStudioDecks] = useState<StudioDeckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDevDeck, setCreatingDevDeck] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/studio/session?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { deckId?: string } | null) => {
          if (data?.deckId) {
            router.replace(`/studio/${data.deckId}`);
            return;
          }
          loadDecks();
        })
        .catch(() => loadDecks())
        .finally(() => setLoading(false));
    } else {
      loadDecks().finally(() => setLoading(false));
    }
  }, [sessionId, router]);

  async function loadDecks() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [legacyResult, studioResult] = await Promise.all([
      supabase
        .from('decks')
        .select('id, border_name, total_cards, completed_cards, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('studio_decks')
        .select('id, border_slug, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
    ]);

    setDecks((legacyResult.data as DeckRow[]) ?? []);
    setStudioDecks((studioResult.data as StudioDeckRow[]) ?? []);
  }

  async function handleCreateDevDeck() {
    setCreatingDevDeck(true);
    try {
      const res = await fetch('/api/studio/dev-deck', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        console.error('Dev deck failed', res.status, data);
        alert('Failed to create dev deck');
        return;
      }
      if (data.deckId) {
        router.push(`/studio/${data.deckId}`);
        return;
      }
      console.error('Dev deck: no deckId in response', data);
      alert('Failed to create dev deck');
    } catch (err) {
      console.error('Dev deck error', err);
      alert('Failed to create dev deck');
    } finally {
      setCreatingDevDeck(false);
    }
  }

  if (loading) {
    return (
      <div className="text-charcoal">
        <p className="text-center">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-6 text-sm text-charcoal/70">
        <Link href="/studio-beta" className="underline underline-offset-2 hover:no-underline">
          ← Back to border preview
        </Link>
      </p>
      <h1 className="text-3xl font-semibold text-charcoal">
        Studio
      </h1>
      <p className="mt-2 text-charcoal/70">
        Your deck projects. Pick one to continue designing.
      </p>
      {studioDecks.length === 0 && decks.length === 0 ? (
        <div className="mt-10 space-y-6">
          {isDev && (
            <div>
              <button
                type="button"
                onClick={handleCreateDevDeck}
                disabled={creatingDevDeck}
                className="rounded-[2px] border border-charcoal bg-charcoal px-6 py-2 text-cream transition hover:bg-charcoal/90 disabled:opacity-50"
              >
                {creatingDevDeck ? 'Creating deck…' : 'Create Dev Test Deck'}
              </button>
            </div>
          )}
          <div className="rounded-sm border border-charcoal/10 bg-cardBg p-8 text-center text-charcoal/70">
            <p>You don’t have any decks yet.</p>
            <p className="mt-2">
              <Link href="/studio-beta" className="text-charcoal underline underline-offset-2 hover:no-underline">
                Open Studio
              </Link>
              {' '}
              to start a deck, or{' '}
              <Link href="/borders" className="text-charcoal underline underline-offset-2 hover:no-underline">
                choose a border
              </Link>{' '}
              to purchase a print-ready project.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {studioDecks.map((sd) => (
            <li key={sd.id}>
              <Link
                href={`/studio-beta?border=${encodeURIComponent(sd.border_slug)}`}
                className="block rounded-sm border border-charcoal/10 bg-cardBg p-4 text-charcoal transition hover:border-charcoal/20"
              >
                <span className="font-medium">{studioBorderDisplayName(sd.border_slug)}</span>
                <span className="ml-2 text-charcoal/70">— Studio (beta)</span>
              </Link>
            </li>
          ))}
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/studio/${deck.id}`}
                className="block rounded-sm border border-charcoal/10 bg-cardBg p-4 text-charcoal transition hover:border-charcoal/20"
              >
                <span>{deck.border_name}</span>
                <span className="ml-2 text-charcoal/70">
                  — {deck.completed_cards}/{deck.total_cards} cards
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StudioBetaProjectsPage() {
  return (
    <Suspense fallback={<div className="text-charcoal"><p className="text-center">Loading…</p></div>}>
      <StudioBetaProjectsContent />
    </Suspense>
  );
}
