import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog';
import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { getAllTemplates } from '@/lib/templates';
import { SITE_URL } from '@/lib/site';

/** Sitemap lastmod for main marketing pages (see SEO task date). */
const LASTMOD_MAIN = new Date('2026-03-29T12:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await getAllTemplates();

  const mainPaths = [
    '/',
    '/templates',
    '/how-it-works',
    '/custom-printing',
    '/blog',
    '/borders',
    '/studio-beta',
    '/card-meanings',
    '/account',
    '/privacy',
    '/terms',
  ];

  const mainEntries: MetadataRoute.Sitemap = mainPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LASTMOD_MAIN,
  }));

  const borderEntries: MetadataRoute.Sitemap = BORDER_TEMPLATES.map((b) => ({
    url: `${SITE_URL}/borders/${b.slug}`,
    lastModified: LASTMOD_MAIN,
  }));

  const templateEntries: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${SITE_URL}/templates/${t.slug}`,
    lastModified: LASTMOD_MAIN,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(`${post.dateISO}T12:00:00.000Z`),
  }));

  return [...mainEntries, ...borderEntries, ...templateEntries, ...blogEntries];
}
