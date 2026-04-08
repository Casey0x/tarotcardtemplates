'use client';

import { useCallback, useEffect, useState } from 'react';

type Item = { id: string; preview_url: string | null; original_filename: string | null };

type Props = {
  disabled?: boolean;
  onPick: (artworkId: string) => void | Promise<void>;
};

export function StudioArtworkPicker({ disabled, onPick }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/artwork-library', { credentials: 'include' });
      const j = (await res.json()) as { items?: Item[]; error?: string };
      if (!res.ok) {
        setError(j.error || 'Could not load artwork');
        setItems([]);
        return;
      }
      setItems(j.items ?? []);
    } catch {
      setError('Could not load artwork');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-sm border border-charcoal/10 bg-cream/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-charcoal">My artwork</h3>
        <button
          type="button"
          onClick={() => void load()}
          className="text-[10px] text-charcoal/60 underline underline-offset-2 hover:text-charcoal"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-[10px] text-charcoal/55">Tap an image to use it on the selected card.</p>
      {loading ? <p className="mt-2 text-[10px] text-charcoal/55">Loading…</p> : null}
      {error ? (
        <p className="mt-2 text-[10px] text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && items.length === 0 ? (
        <p className="mt-2 text-[10px] text-charcoal/55">Upload art on a card to build your library.</p>
      ) : null}
      <ul className="mt-2 grid grid-cols-3 gap-1.5">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              disabled={disabled || !it.preview_url}
              onClick={() => void onPick(it.id)}
              className="relative aspect-square w-full overflow-hidden rounded-xs border border-charcoal/10 bg-charcoal/5 hover:border-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50"
              title={it.original_filename ?? 'Artwork'}
            >
              {it.preview_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed URLs
                <img src={it.preview_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[9px] text-charcoal/45">No preview</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
