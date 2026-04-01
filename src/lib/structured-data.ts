import { borderPriceUsdFormatted, type Border } from '@/data/borders';
import type { TarotTemplate } from '@/lib/templates';
import type { BlogPost } from '@/data/blog';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { getTemplatePreviewImages } from '@/lib/templates';

export function borderProductJsonLd(border: Border, slug: string) {
  const pageUrl = `${SITE_URL}/borders/${slug}`;
  const raw = border.image?.trim() ? border.image : '';
  const imageUrl = raw.startsWith('http') ? raw : absoluteUrl(raw || '/favicon.svg');
  const price = borderPriceUsdFormatted(border);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: border.name,
    description: border.description,
    image: imageUrl,
    brand: { '@type': 'Brand', name: 'Tarot Card Templates' },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
  };
}

export function templateProductJsonLd(template: TarotTemplate) {
  const pageUrl = `${SITE_URL}/templates/${template.slug}`;
  const previews = getTemplatePreviewImages(template);
  const imageUrl = previews[0]?.startsWith('http') ? previews[0] : absoluteUrl(previews[0] || '/favicon.svg');

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: template.name,
    description: template.description,
    image: imageUrl,
    brand: { '@type': 'Brand', name: 'Tarot Card Templates' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Digital template',
        price: String(template.templatePrice),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
      },
      {
        '@type': 'Offer',
        name: 'Printed deck from template',
        price: String(template.printPrice),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
      },
    ],
  };
}

export function blogPostingJsonLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: `${post.dateISO}T12:00:00.000Z`,
    author: {
      '@type': 'Organization',
      name: 'Tarot Card Templates',
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}
