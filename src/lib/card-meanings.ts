import { supabaseRestFetch } from '@/lib/supabase-rest';

export type CardMeaning = {
  slug: string;
  name: string;
  number?: string;
  arcana: string;
  uprightKeywords?: string[];
  reversedKeywords?: string[];
  uprightMeaning?: string;
  reversedMeaning?: string;
  love?: string;
  career?: string;
  health?: string;
  yesOrNo?: string;
  asAPerson?: string;
  feelings?: string;
  advice?: string;
  featuredImageUrl?: string;
};

type CardMeaningRow = {
  slug: string;
  name: string;
  number: string | null;
  arcana: string;
  upright_keywords: string[] | null;
  reversed_keywords: string[] | null;
  upright_meaning: string | null;
  reversed_meaning: string | null;
  love: string | null;
  career: string | null;
  health: string | null;
  yes_or_no: string | null;
  as_a_person: string | null;
  feelings: string | null;
  advice: string | null;
  featured_image_url: string | null;
};

const selectFields =
  'slug,name,number,arcana,upright_keywords,reversed_keywords,' +
  'upright_meaning,reversed_meaning,love,career,health,' +
  'yes_or_no,as_a_person,feelings,advice,featured_image_url';

function mapCardRow(row: CardMeaningRow): CardMeaning {
  return {
    slug: row.slug,
    name: row.name,
    number: row.number ?? undefined,
    arcana: row.arcana,
    uprightKeywords: row.upright_keywords ?? undefined,
    reversedKeywords: row.reversed_keywords ?? undefined,
    uprightMeaning: row.upright_meaning ?? undefined,
    reversedMeaning: row.reversed_meaning ?? undefined,
    love: row.love ?? undefined,
    career: row.career ?? undefined,
    health: row.health ?? undefined,
    yesOrNo: row.yes_or_no ?? undefined,
    asAPerson: row.as_a_person ?? undefined,
    feelings: row.feelings ?? undefined,
    advice: row.advice ?? undefined,
    featuredImageUrl: row.featured_image_url ?? undefined,
  };
}

export async function getAllCardMeanings(): Promise<CardMeaning[]> {
  const response = await supabaseRestFetch(
    `card_meanings?select=${selectFields}&order=arcana.asc,number.asc`,
    { cache: 'no-store' }
  );
  if (!response.ok) throw new Error(`Failed to fetch card meanings (${response.status})`);
  const rows = (await response.json()) as CardMeaningRow[];
  return rows.map(mapCardRow);
}

export async function getCardMeaningBySlug(slug: string): Promise<CardMeaning | null> {
  const response = await supabaseRestFetch(
    `card_meanings?select=${selectFields}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { cache: 'no-store' }
  );
  if (!response.ok) throw new Error(`Failed to fetch card "${slug}" (${response.status})`);
  const rows = (await response.json()) as CardMeaningRow[];
  return rows.length > 0 ? mapCardRow(rows[0]) : null;
}
