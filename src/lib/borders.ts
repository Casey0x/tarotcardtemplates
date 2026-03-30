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
    image: '/images/border-thumbs/celestial-gilded.png',
  },
  {
    name: 'Minimal Line Border',
    slug: 'minimal-line',
    description: 'Clean minimalist tarot frame with subtle corner symbols and modern spacing.',
    image: '/images/border-thumbs/minimal-line.png',
  },
  {
    name: 'Vintage Velvet Border',
    slug: 'vintage-velvet',
    description: 'Baroque-inspired gilded frame with dramatic jewel tones and theatrical ornament.',
    image: '/images/border-thumbs/vintage-velvet.png',
  },
];
