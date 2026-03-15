'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface DeckRow {
  id: string;
  border_name: string;
  total_cards: number;
  completed_cards: number;
  status: string;
  created_at: string;
}

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [loading, setLoading] = useState(true);

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
    const { data } = await supabase
      .from('decks')
      .select('id, border_name, total_cards, completed_cards, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setDecks((data as DeckRow[]) ?? []);
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
      <h1 className="text-3xl font-semibold text-charcoal">
        Studio
      </h1>
      <p className="mt-2 text-charcoal/70">
        Your deck projects. Pick one to continue designing.
      </p>
      {decks.length === 0 ? (
        <div className="mt-10 rounded-sm border border-charcoal/10 bg-cardBg p-8 text-center text-charcoal/70">
          <p>You don’t have any decks yet.</p>
          <p className="mt-2">
            <Link
              href="/borders"
              className="text-charcoal underline underline-offset-2 hover:no-underline"
            >
              Choose a border
            </Link>
            {' '}and purchase to start designing.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
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

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="text-charcoal"><p className="text-center">Loading…</p></div>}>
      <StudioContent />
    </Suspense>
  );
}
