import { supabaseRestFetch } from '@/lib/supabase-rest';

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
  };
}

const selectFields =
  'slug,name,description,style_note,includes,template_price,print_price,featured,preview_images';

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
