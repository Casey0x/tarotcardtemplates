/**
 * Single source of truth for tarot border templates.
 * Used by /borders, /borders/[slug], and /templates (View all) so no border is ever missing from navigation.
 */

export type BorderTemplate = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export const BORDER_TEMPLATES: BorderTemplate[] = [
  {
    slug: 'celestial-gilded',
    name: 'Celestial Gilded Border',
    description:
      'Elegant celestial tarot border featuring flowing botanical ornament and gold celestial motifs.',
    image: '/images/template-styles/celestial-gilded.png',
  },
  {
    slug: 'minimal-line',
    name: 'Minimal Line Border',
    description:
      'Clean minimalist tarot border designed for modern tarot decks and simple layouts.',
    image: '/images/template-styles/minimal-line-arcana.png',
  },
  {
    slug: 'vintage-velvet',
    name: 'Vintage Velvet Border',
    description:
      'Luxurious baroque tarot border with velvet textures and dramatic gold ornament.',
    image: '/images/template-styles/vintage-velvet.png',
  },
  {
    slug: 'marble-temple',
    name: 'Marble Temple Tarot Border',
    description:
      'Classical marble tarot card border with fluted columns and an arched central window for your artwork.',
    image: '/images/templates/marble-temple-tarot-border.png',
  },
  {
    slug: 'gothic-cathedral',
    name: 'Gothic Cathedral Tarot Border',
    description:
      'A gothic cathedral inspired tarot card border featuring elegant pointed arches and delicate medieval tracery.',
    image: '/images/templates/gothic-cathedral-tarot-border.png',
  },
];

export function getBorderBySlug(slug: string): BorderTemplate | undefined {
  return BORDER_TEMPLATES.find((b) => b.slug === slug);
}

/** Map slug -> border for [slug] page and generateMetadata */
export function getBordersRecord(): Record<
  string,
  { name: string; image: string; description: string }
> {
  return Object.fromEntries(
    BORDER_TEMPLATES.map((b) => [b.slug, { name: b.name, image: b.image, description: b.description }])
  );
}
