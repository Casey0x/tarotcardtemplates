/**
 * Single source of truth for tarot border templates.
 * Used by /borders, /borders/[slug], and /templates (View all) so no border is ever missing from navigation.
 */

export type BorderTemplate = {
  slug: string;
  name: string;
  description: string;
  /** Long product description for the Product Description section (paragraphs separated by \n\n) */
  productDescription: string;
  image: string;
};

export const BORDER_TEMPLATES: BorderTemplate[] = [
  {
    slug: 'celestial-gilded',
    name: 'Celestial Gilded Border',
    description:
      'Elegant celestial tarot border featuring flowing botanical ornament and gold celestial motifs.',
    productDescription:
      'The Celestial Gilded tarot card border template combines elegant gold detailing with subtle cosmic motifs. Designed for mystical and astrology-inspired decks, this frame enhances your tarot illustrations while maintaining a clean composition. The transparent center window allows easy placement of artwork in Canva or Photoshop, while the decorative border adds a celestial atmosphere to each card. Perfect for spiritual, star-themed, or magical tarot decks.',
    image: '/images/template-styles/celestial-gilded.png',
  },
  {
    slug: 'minimal-line',
    name: 'Minimal Line Border',
    description:
      'Clean minimalist tarot border designed for modern tarot decks and simple layouts.',
    productDescription:
      'The Minimal Line tarot card border template is designed for modern tarot decks that favor simplicity and clean structure. A thin geometric frame surrounds the card while leaving maximum space for your artwork. The transparent center area allows you to insert illustrations quickly in Canva or Photoshop while maintaining consistent card proportions. This template works especially well for contemporary tarot designs, AI-generated artwork, or minimalist oracle decks.',
    image: '/images/template-styles/minimal-line-arcana.png',
  },
  {
    slug: 'vintage-velvet',
    name: 'Vintage Velvet Border',
    description:
      'Luxurious baroque tarot border with velvet textures and dramatic gold ornament.',
    productDescription:
      'The Vintage Velvet tarot card border template features ornate golden flourishes set against a rich velvet background inspired by antique tarot decks and Victorian book design. The decorative frame surrounds your artwork while leaving a transparent center window for your illustration.\n\nDesigned for standard tarot card proportions, the template works seamlessly in Canva or Photoshop. Simply place your artwork inside the frame, add card titles and numerals, and export your cards as print-ready files.\n\nThis border style is ideal for gothic, romantic, or classical tarot decks where rich textures and elegant ornamentation enhance the artwork.',
    image: '/images/template-styles/vintage-velvet.png',
  },
  {
    slug: 'marble-temple',
    name: 'Marble Temple Tarot Border',
    description:
      'Classical marble tarot card border with fluted columns and an arched central window for your artwork.',
    productDescription:
      'The Marble Temple tarot card border template uses classical marble architecture to frame your card art: fluted stone columns, a temple-style arch, and a transparent center window for your illustration. It was designed for standard tarot card dimensions and is ideal for mystical or traditional tarot decks. Simply place your artwork inside the frame in Canva or Photoshop and export print-ready files.\n\nWhether you are creating a Rider–Waite inspired deck, a fantasy tarot, or using AI-generated artwork, this border gives each card a consistent, elegant frame. The transparent center area is sized for your tarot imagery; add card names and numerals inside the marble frame, then export for print or digital use. Suitable for tarot deck creators who want a timeless, temple-style frame.',
    image: '/images/templates/marble-temple-tarot-border.png',
  },
  {
    slug: 'gothic-cathedral',
    name: 'Gothic Cathedral Tarot Border',
    description:
      'A gothic cathedral inspired tarot card border featuring elegant pointed arches and delicate medieval tracery.',
    productDescription:
      'The Gothic Cathedral tarot card border template brings medieval grandeur to your tarot deck with elegant pointed arches and delicate tracery. Inspired by sacred architecture, this frame gives your card art a dramatic, reverent presentation. The transparent center window lets you place your illustration in Canva or Photoshop while the ornate border adds depth and atmosphere. Ideal for dark fantasy, historical, or spiritually themed tarot and oracle decks.',
    image: '/images/templates/gothic-cathedral-tarot-border.png',
  },
];

export function getBorderBySlug(slug: string): BorderTemplate | undefined {
  return BORDER_TEMPLATES.find((b) => b.slug === slug);
}

/** Map slug -> border for [slug] page and generateMetadata */
export function getBordersRecord(): Record<
  string,
  { name: string; image: string; description: string; productDescription: string }
> {
  return Object.fromEntries(
    BORDER_TEMPLATES.map((b) => [
      b.slug,
      { name: b.name, image: b.image, description: b.description, productDescription: b.productDescription },
    ])
  );
}
