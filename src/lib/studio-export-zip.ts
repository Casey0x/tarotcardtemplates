import type { SupabaseClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { getTarotDefault } from '@/lib/tarot-cards';
import type { StudioExportType } from '@/lib/studio-export-constants';

const STUDIO_RENDERS_BUCKET = 'studio-renders';

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

function cardIndexRange(exportType: StudioExportType): { start: number; end: number } {
  if (exportType === 'major_arcana') return { start: 0, end: 21 };
  return { start: 0, end: 77 };
}

export type StudioZipBuildResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; error: string; missingIndices: number[] };

export async function buildStudioExportZip(
  admin: SupabaseClient,
  deckId: string,
  exportType: StudioExportType,
): Promise<StudioZipBuildResult> {
  const { start, end } = cardIndexRange(exportType);

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
    if (Number.isFinite(idx) && idx >= start && idx <= end && path) {
      byIndex.set(idx, path);
    }
  }

  const missing: number[] = [];
  for (let i = start; i <= end; i++) {
    if (!byIndex.has(i)) missing.push(i);
  }
  if (missing.length > 0) {
    return {
      ok: false,
      error: 'Not all required cards have a saved render in storage.',
      missingIndices: missing,
    };
  }

  const zip = new JSZip();
  for (let i = start; i <= end; i++) {
    const path = byIndex.get(i)!;
    const { data: blob, error: dlErr } = await admin.storage.from(STUDIO_RENDERS_BUCKET).download(path);
    if (dlErr || !blob) {
      return {
        ok: false,
        error: dlErr?.message ?? `Failed to download render for card ${i + 1}`,
        missingIndices: [i],
      };
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    zip.file(cardFileName(i), buf);
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return { ok: true, buffer };
}

export function zipResponseHeaders(filename = 'tarot-deck.zip'): HeadersInit {
  return {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  };
}
