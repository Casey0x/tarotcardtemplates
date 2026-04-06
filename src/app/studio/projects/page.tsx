'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface StudioDeckRow {
  id: string;
  border_slug: string;
  updated_at: string;
  created_at?: string;
}

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function StudioProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [decks, setDecks] = useState<StudioDeckRow[]>([]);
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
    const { data, error } = await supabase
      .from('studio_decks')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('[studio/projects] load studio_decks', error);
      setDecks([]);
      return;
    }
    setDecks((data as StudioDeckRow[]) ?? []);
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
        <Link href="/studio" className="underline underline-offset-2 hover:no-underline">
          ← Back to border preview
        </Link>
      </p>
      <h1 className="text-3xl font-semibold text-charcoal">
        Studio
      </h1>
      <p className="mt-2 text-charcoal/70">
        Your deck projects. Pick one to continue designing.
      </p>
      {decks.length === 0 ? (
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
            <p className="text-lg font-medium text-charcoal">Start your first deck</p>
            <p className="mt-2">
              Open{' '}
              <Link
                href="/studio"
                className="text-charcoal underline underline-offset-2 hover:no-underline"
              >
                Studio
              </Link>
              , choose a border, and your project will show up here.
            </p>
            <p className="mt-4">
              <Link
                href="/borders"
                className="text-charcoal underline underline-offset-2 hover:no-underline"
              >
                Browse borders
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/studio?border=${encodeURIComponent(deck.border_slug)}`}
                className="block rounded-sm border border-charcoal/10 bg-cardBg p-4 text-charcoal transition hover:border-charcoal/20"
              >
                <span className="font-medium">{deck.border_slug}</span>
                <span className="ml-2 block text-sm text-charcoal/70 sm:inline sm:ml-3">
                  Last updated {formatUpdatedAt(deck.updated_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StudioProjectsPage() {
  return (
    <Suspense fallback={<div className="text-charcoal"><p className="text-center">Loading…</p></div>}>
      <StudioProjectsContent />
    </Suspense>
  );
}
