'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StudioProjectsDevDeckButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleCreateDevDeck() {
    setCreating(true);
    try {
      const res = await fetch('/api/studio/dev-deck', { method: 'POST' });
      const data = (await res.json()) as { deckId?: string; error?: string };
      if (!res.ok) {
        console.error('Dev deck failed', res.status, data);
        alert(data.error || 'Failed to create dev deck');
        return;
      }
      if (data.deckId) {
        router.push(`/studio/${data.deckId}`);
        return;
      }
      alert('Failed to create dev deck');
    } catch (e) {
      console.error(e);
      alert('Failed to create dev deck');
    } finally {
      setCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCreateDevDeck()}
      disabled={creating}
      className="rounded-[2px] border border-charcoal bg-charcoal px-6 py-2 text-cream transition hover:bg-charcoal/90 disabled:opacity-50"
    >
      {creating ? 'Creating deck…' : 'Create Dev Test Deck (purchase flow)'}
    </button>
  );
}
