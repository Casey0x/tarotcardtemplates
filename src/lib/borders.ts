export type BorderStyle = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

export const BORDER_STYLES: BorderStyle[] = [
  {
    name: 'Celestial Gilded Border',
    slug: 'celestial-gilded',
    description: 'Rich gold celestial motifs with stars, moons, and ornate tarot symbolism.',
    image: '/images/template-styles/celestial-gilded.png',
  },
  {
    name: 'Minimal Line Border',
    slug: 'minimal-line',
    description: 'Clean minimalist tarot frame with subtle corner symbols and modern spacing.',
    image: '/images/template-styles/minimal-line-arcana.png',
  },
  {
    name: 'Vintage Velvet Border',
    slug: 'vintage-velvet',
    description: 'Baroque-inspired gilded frame with dramatic jewel tones and theatrical ornament.',
    image: '/images/template-styles/vintage-velvet.png',
  },
  {
    name: 'Gothic Cathedral Tarot Border',
    slug: 'gothic-cathedral',
    description:
      'A gothic cathedral inspired tarot card border featuring elegant pointed arches and delicate medieval tracery. The center artwork window is transparent and designed for inserting tarot illustrations.',
    image: '/images/templates/gothic-cathedral-tarot-border.png',
  },
];
