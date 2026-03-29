/**
 * Static copy + imagery for tarot border templates.
 *
 * The canonical list of active borders now lives in the Supabase `borders` table.
 * We merge rows from that table with this static metadata (images, long description)
 * so UI components can keep using a single `Border` shape.
 */

import { createServiceClient } from '@/lib/supabase-server';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';
import { BORDER_TEMPLATES, type BorderTemplate } from '@/data/border-templates-static';

export { FALLBACK_BORDER_IMAGE, BORDER_TEMPLATES, type BorderTemplate };

type BorderRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preview_image_url: string | null;
  templated_template_id: string | null;
  price_major_arcana: number | null;
  price_full_deck: number | null;
  is_active: boolean | null;
};

export type Border = {
  id: string;
  slug: string;
  name: string;
  description: string;
  productDescription: string;
  image: string;
  /** Transparent-center asset for Studio overlay when set in static metadata. */
  transparentImage: string | null;
  templatedTemplateId: string | null;
  priceMajorArcana: number | null;
  priceFullDeck: number | null;
  isActive: boolean;
};

function borderFromStatic(t: BorderTemplate): Border {
  return {
    id: `static-${t.slug}`,
    slug: t.slug,
    name: t.name,
    description: t.description,
    productDescription: t.productDescription,
    image: t.image?.trim() ? t.image : FALLBACK_BORDER_IMAGE,
    transparentImage: t.transparentImage?.trim() ? t.transparentImage.trim() : null,
    templatedTemplateId: null,
    priceMajorArcana: null,
    priceFullDeck: null,
    isActive: true,
  };
}

function applyStaticMetadata(row: BorderRow): Border {
  const staticMeta = BORDER_TEMPLATES.find((b) => b.slug === row.slug);
  const preview = row.preview_image_url?.trim();

  return {
    id: row.id,
    slug: row.slug,
    name: row.name || staticMeta?.name || row.slug,
    description: row.description || staticMeta?.description || '',
    productDescription: staticMeta?.productDescription ?? '',
    image: preview || staticMeta?.image || FALLBACK_BORDER_IMAGE,
    transparentImage: staticMeta?.transparentImage?.trim()
      ? staticMeta.transparentImage.trim()
      : null,
    templatedTemplateId: row.templated_template_id,
    priceMajorArcana: row.price_major_arcana,
    priceFullDeck: row.price_full_deck,
    isActive: !!row.is_active,
  };
}

export async function fetchBorders(): Promise<Border[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('borders')
      .select('id, name, slug, description, preview_image_url, templated_template_id, price_major_arcana, price_full_deck, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchBorders:', error.message);
      return BORDER_TEMPLATES.map(borderFromStatic);
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      return BORDER_TEMPLATES.map(borderFromStatic);
    }
    return rows.map(applyStaticMetadata);
  } catch (e) {
    console.warn('fetchBorders failed:', e);
    return BORDER_TEMPLATES.map(borderFromStatic);
  }
}

export async function fetchBorderBySlug(slug: string): Promise<Border | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('borders')
      .select('id, name, slug, description, preview_image_url, templated_template_id, price_major_arcana, price_full_deck, is_active')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle<BorderRow>();

    if (error) {
      console.warn('fetchBorderBySlug:', error.message);
      const staticMeta = BORDER_TEMPLATES.find((b) => b.slug === slug);
      return staticMeta ? borderFromStatic(staticMeta) : null;
    }

    if (!data) {
      const staticMeta = BORDER_TEMPLATES.find((b) => b.slug === slug);
      return staticMeta ? borderFromStatic(staticMeta) : null;
    }
    return applyStaticMetadata(data);
  } catch (e) {
    console.warn('fetchBorderBySlug failed:', e);
    const staticMeta = BORDER_TEMPLATES.find((b) => b.slug === slug);
    return staticMeta ? borderFromStatic(staticMeta) : null;
  }
}

/** Map slug -> Border for generateMetadata use-cases if needed elsewhere. */
export async function fetchBordersRecord(): Promise<Record<string, Border>> {
  const list = await fetchBorders();
  return Object.fromEntries(list.map((b) => [b.slug, b]));
}
