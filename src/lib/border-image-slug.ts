import { BORDER_TEMPLATES } from '@/data/border-templates-static';

/** DB/catalog slug aliases ↔ canonical private asset base name (without `-transparent` / `.png`). */
const BORDER_IMAGE_SLUG_ALIASES: Record<string, string> = {
  'ocean-depths': 'ocean-mermaid',
  'vintage-velvet-border': 'vintage-velvet',
};

const ALLOWED_CANONICAL = new Set(BORDER_TEMPLATES.map((b) => b.slug));

/** Resolve request slug to a canonical template slug that has private/full-res PNGs. */
export function resolveBorderImageSlug(slug: string): { canonical: string; ok: boolean } {
  const trimmed = slug?.trim() ?? '';
  if (!trimmed) return { canonical: '', ok: false };
  const mapped = BORDER_IMAGE_SLUG_ALIASES[trimmed] ?? trimmed;
  if (!ALLOWED_CANONICAL.has(mapped)) return { canonical: mapped, ok: false };
  return { canonical: mapped, ok: true };
}

/** Normalize `?border=` query slugs (aliases) toward a catalog template slug when recognized. */
export function normalizeBorderQuerySlug(slug: string): string {
  const { canonical, ok } = resolveBorderImageSlug(slug);
  return ok ? canonical : slug.trim();
}
