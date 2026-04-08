import type { SupabaseClient } from '@supabase/supabase-js';
import archiver from 'archiver';
import { Readable } from 'node:stream';
import { getTarotDefault } from '@/lib/tarot-cards';

const STUDIO_RENDERS_BUCKET = 'studio-renders';

/** Server-side build budget before returning a JSON timeout (ms). */
export const EXPORT_BUILD_TIMEOUT_MS = 25_000;

export class StudioExportTimeoutError extends Error {
  constructor() {
    super('EXPORT_TIMEOUT');
    this.name = 'StudioExportTimeoutError';
  }
}

function cardFileName(cardIndex: number): string {
  const d = getTarotDefault(cardIndex);
  const slug =
    d?.name
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ?? `card-${cardIndex}`;
  const ord = String(cardIndex + 1).padStart(2, '0');
  return `${ord}-${slug}.png`;
}

export type StudioZipBuildResult =
  | { ok: true; nodeStream: Readable }
  | { ok: false; error: string; missingIndices: number[] };

/**
 * ZIP all cards that have a saved render (`image_path`) for this deck, in card index order.
 * Free download — no suite gating.
 */
export async function buildStudioDeckZipAllRendered(
  admin: SupabaseClient,
  deckId: string,
): Promise<StudioZipBuildResult> {
  const { data: rows, error } = await admin
    .from('studio_cards')
    .select('card_index, image_path')
    .eq('deck_id', deckId);

  if (error) {
    return { ok: false, error: error.message, missingIndices: [] };
  }

  const byIndex = new Map<number, string>();
  for (const row of rows ?? []) {
    const idx =
      typeof row.card_index === 'number'
        ? row.card_index
        : row.card_index != null
          ? Number(row.card_index)
          : NaN;
    const path = row.image_path != null ? String(row.image_path).trim() : '';
    if (Number.isFinite(idx) && idx >= 0 && idx <= 77 && path) {
      byIndex.set(idx, path);
    }
  }

  if (byIndex.size === 0) {
    return {
      ok: false,
      error: 'No rendered cards to export yet.',
      missingIndices: [],
    };
  }

  const indices = [...byIndex.keys()].sort((a, b) => a - b);

  let downloaded: { index: number; buffer: Buffer }[];
  try {
    downloaded = await Promise.all(
      indices.map(async (i) => {
        const path = byIndex.get(i)!;
        const { data: blob, error: dlErr } = await admin.storage
          .from(STUDIO_RENDERS_BUCKET)
          .download(path);
        if (dlErr || !blob) {
          throw new Error(dlErr?.message ?? `Failed to download render for card ${i + 1}`);
        }
        const buffer = Buffer.from(await blob.arrayBuffer());
        return { index: i, buffer };
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Download failed';
    return { ok: false, error: msg, missingIndices: [] };
  }

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err: Error) => {
    console.error('[studio-export-zip] archiver', err);
  });

  for (const { index, buffer } of downloaded) {
    archive.append(buffer, { name: cardFileName(index) });
  }

  void archive.finalize();

  return { ok: true, nodeStream: archive };
}

export function zipResponseHeaders(filename = 'tarot-deck.zip'): HeadersInit {
  return {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  };
}

export function withExportBuildTimeout<T>(p: Promise<T>, ms = EXPORT_BUILD_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new StudioExportTimeoutError()), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
