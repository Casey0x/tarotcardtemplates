import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog';

const baseUrl = 'https://tarotcardtemplates.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['/', '/templates', '/how-it-works', '/custom-printing', '/blog'];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.dateISO
  }));

  return [...staticEntries, ...blogEntries];
}
