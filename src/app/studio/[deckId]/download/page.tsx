'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface CardRow {
  id: string;
  card_index: number;
  card_name: string | null;
  render_url: string | null;
  status: string;
}

export default function StudioDownloadPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const [cards, setCards] = useState<CardRow[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [deckName, setDeckName] = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: d } = await supabase.from('decks').select('border_name').eq('id', deckId).single();
    if (d) setDeckName((d as { border_name: string }).border_name);
    const { data: c } = await supabase.from('cards').select('id, card_index, card_name, render_url, status').eq('deck_id', deckId).order('card_index');
    setCards((c as CardRow[]) ?? []);
  }, [deckId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDownload() {
    const withUrl = cards.filter((c) => c.render_url);
    if (!withUrl.length) return;
    setDownloading(true);
    const zip = new JSZip();
    const folder = zip.folder(deckName || 'tarot-deck');
    if (!folder) {
      setDownloading(false);
      return;
    }
    try {
      await Promise.all(
        withUrl.map(async (c, i) => {
          const res = await fetch(c.render_url!);
          const blob = await res.blob();
          const name = c.card_name?.replace(/[^a-z0-9-_]/gi, '_') || `card_${c.card_index + 1}`;
          folder.file(`${String(i + 1).padStart(2, '0')}_${name}.png`, blob);
        })
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(deckName || 'tarot-deck').replace(/\s+/g, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const rendered = cards.filter((c) => c.render_url);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href={`/studio/${deckId}/review`} className="text-charcoal/70 hover:text-charcoal">
        ← Review
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-charcoal">Download deck</h1>
      <p className="mt-2 text-charcoal/70">
        {rendered.length} cards will be bundled into a ZIP file.
      </p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={rendered.length === 0 || downloading}
        className="mt-6 rounded-[2px] border border-charcoal bg-charcoal px-6 py-3 text-cream transition hover:bg-charcoal/90 disabled:opacity-50"
      >
        {downloading ? 'Preparing ZIP…' : 'Download ZIP'}
      </button>
    </div>
  );
}
