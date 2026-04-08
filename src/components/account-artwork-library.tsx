'use client';

import { useCallback, useEffect, useState } from 'react';

type Item = { id: string; preview_url: string | null; original_filename: string | null; created_at?: string };

export function AccountArtworkLibrary() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/artwork-library', { credentials: 'include' });
      if (res.status === 401) {
        setItems([]);
        return;
      }
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

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/studio/artwork-library', { method: 'POST', body: fd, credentials: 'include' });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(j.error || 'Upload failed');
        return;
      }
      await load();
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this image from your library? Cards using it will lose the link.')) return;
    setError(null);
    try {
      const res = await fetch(`/api/studio/artwork-library?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(j.error || 'Delete failed');
        return;
      }
      await load();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-charcoal">My artwork</h2>
      <p className="mt-2 text-sm text-charcoal/75">
        Images you upload in the Studio are saved here permanently. They stay when you change borders or reset a deck
        session.
      </p>
      <div className="mt-4">
        <label className="inline-flex cursor-pointer rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90 disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload new image'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void uploadFile(f);
            }}
          />
        </label>
      </div>
      {loading ? <p className="mt-4 text-sm text-charcoal/60">Loading…</p> : null}
      {error ? (
        <p className="mt-4 text-sm text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && items.length === 0 ? (
        <p className="mt-4 text-sm text-charcoal/70">No artwork yet. Upload from here or from the Studio.</p>
      ) : null}
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it) => (
          <li key={it.id} className="rounded-sm border border-charcoal/10 bg-cardBg p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xs border border-charcoal/10 bg-charcoal/5">
              {it.preview_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.preview_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-charcoal/45">No preview</span>
              )}
            </div>
            <p className="mt-2 truncate text-xs text-charcoal/70" title={it.original_filename ?? 'Artwork'}>
              {it.original_filename ?? 'Artwork'}
            </p>
            <button
              type="button"
              onClick={() => void remove(it.id)}
              className="mt-2 text-xs text-red-800/90 underline underline-offset-2 hover:text-red-950"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
