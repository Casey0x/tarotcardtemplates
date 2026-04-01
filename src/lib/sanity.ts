import type {TarotTemplate} from '@/data/templates';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';
const token = process.env.SANITY_READ_TOKEN;

const isConfigured = Boolean(projectId && dataset);

export type SanityTemplate = {
  name?: string;
  slug?: {current?: string};
  description?: string;
  styleNote?: string;
  includes?: string[];
  templatePrice?: number;
  printPrice?: number;
  featured?: boolean;
  createdAt?: string;
};

function toTemplate(template: SanityTemplate): TarotTemplate | null {
  const slug = template.slug?.current;
  const name = template.name;

  if (!slug || !name) {
    return null;
  }

  return {
    slug,
    name,
    description: template.description || '',
    styleNote: template.styleNote || '',
    includes: template.includes || [],
    templatePrice: template.templatePrice ?? 18.95,
    printPrice: template.printPrice ?? 24.95,
  };
}

function buildGroqUrl(query: string, params?: Record<string, unknown>) {
  const baseUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
  const searchParams = new URLSearchParams({query});

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(`$${key}`, JSON.stringify(value));
    });
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

async function fetchSanity<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  const headers: HeadersInit = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const response = await fetch(buildGroqUrl(query, params), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Sanity request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {result: T};
  return payload.result;
}

export async function getTemplates(): Promise<TarotTemplate[]> {
  if (!isConfigured) {
    return [];
  }

  const templates = await fetchSanity<SanityTemplate[]>(
    '*[_type == "template"] | order(coalesce(createdAt, _createdAt) desc){name,slug,description,styleNote,includes,templatePrice,printPrice,featured,createdAt}'
  );

  return templates.map(toTemplate).filter((template): template is TarotTemplate => Boolean(template));
}

export async function getTemplateBySlugFromSanity(slug: string): Promise<TarotTemplate | null> {
  if (!isConfigured) {
    return null;
  }

  const template = await fetchSanity<SanityTemplate | null>(
    '*[_type == "template" && slug.current == $slug][0]{name,slug,description,styleNote,includes,templatePrice,printPrice,featured,createdAt}',
    {slug}
  );

  if (!template) {
    return null;
  }

  return toTemplate(template);
}

export async function getFeaturedTemplates(limit = 3): Promise<TarotTemplate[]> {
  if (!isConfigured) {
    return [];
  }

  const templates = await fetchSanity<SanityTemplate[]>(
    '*[_type == "template" && featured == true] | order(coalesce(createdAt, _createdAt) desc)[0...$limit]{name,slug,description,styleNote,includes,templatePrice,printPrice,featured,createdAt}',
    {limit}
  );

  return templates.map(toTemplate).filter((template): template is TarotTemplate => Boolean(template));
}
