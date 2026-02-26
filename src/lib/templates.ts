ximport { supabaseRestFetch } from '@/lib/supabase-rest';

export type TarotTemplate = {
  slug: string;
  name: string;
  description: string;
  styleNote: string;
  includes: string[];
  templatePrice: number;
  printPrice: number;
  featured: boolean;
  previewImages?: string[];
  // SEO fields
  seoHeading?: string;
  seoDescription?: string;
  seoPerfectFor?: string[];
  seoSymbolismHeading?: string;
  seoSymbolismBody?: string;
  seoCardSpotlightHeading?: string;
  seoCardSpotlightBody?: string;
  seoCardSpotlightLink?: string;
};

type TemplateRow = {
  slug: string;
  name: string;
  description: string;
  style_note: string;
  includes: string[] | null;
  template_price: number | string;
  print_price: number | string;
  featured: boolean | null;
  preview_images: string[] | null;
  // SEO fields
  seo_heading: string | null;
  seo_description: string | null;
  seo_perfect_for: string[] | null;
  seo_symbolism_heading: string | null;
  seo_symbolism_body: string | null;
  seo_card_spotlight_heading: string | null;
  seo_card_spotlight_body: string | null;
  seo_card_spotlight_link: string | null;
};

export function mapTemplateRow(row: TemplateRow): TarotTemplate {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    styleNote: row.style_note,
    includes: row.includes ?? [],
    templatePrice: Number(row.template_price),
    printPrice: Number(row.print_price),
    featured: Boolean(row.featured),
    previewImages: row.preview_images ?? undefined,
    seoHeading: row.seo_heading ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    seoPerfectFor: row.seo_perfect_for ?? undefined,
    seoSymbolismHeading: row.seo_symbolism_heading ?? undefined,
    seoSymbolismBody: row.seo_symbolism_body ?? undefined,
    seoCardSpotlightHeading: row.seo_card_spotlight_heading ?? undefined,
    seoCardSpotlightBody: row.seo_card_spotlight_body ?? undefined,
    seoCardSpotlightLink: row.seo_card_spotlight_link ?? undefined,
  };
}

const selectFields =
  'slug,name,description,style_note,includes,template_price,print_price,featured,preview_images,' +
  'seo_heading,seo_description,seo_perfect_for,seo_symbolism_heading,seo_symbolism_body,' +
  'seo_card_spotlight_heading,seo_card_spotlight_body,seo_card_spotlight_link';

export async function getAllTemplates(): Promise<TarotTemplate[]> {
  const response = await supabaseRestFetch(
    `templates?select=${selectFields}&order=featured.desc,name.asc`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch templates (${response.status})`);
  }

  const rows = (await response.json()) as TemplateRow[];
  return rows.map(mapTemplateRow);
}

export async function getTemplateBySlug(slug: string): Promise<TarotTemplate | null> {
  const response = await supabaseRestFetch(
    `templates?select=${selectFields}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch template "${slug}" (${response.status})`);
  }

  const rows = (await response.json()) as TemplateRow[];
  return rows.length > 0 ? mapTemplateRow(rows[0]) : null;
}
