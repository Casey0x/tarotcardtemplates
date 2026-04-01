export type TarotTemplate = {
  slug: string;
  name: string;
  description: string;
  styleNote: string;
  includes: string[];
  templatePrice: number;
  printPrice: number;
};

export const TEMPLATE_PRICE = 18.95;
export const PRINT_PRICE = 24.95;

export const tarotTemplates: TarotTemplate[] = [
  {
    slug: 'linen-classic',
    name: 'Linen Classic',
    description: 'A restrained editorial layout with strong typography and wide margins.',
    styleNote: 'Best for readers wanting a timeless, print-forward look.',
    includes: ['78 card fronts', 'Guidebook cover', 'Print-ready bleed marks'],
    templatePrice: TEMPLATE_PRICE,
    printPrice: PRINT_PRICE
  },
  {
    slug: 'studio-minimal',
    name: 'Studio Minimal',
    description: 'Quiet card framing with balanced spacing and subtle header treatments.',
    styleNote: 'Great for image-led decks that need room to breathe.',
    includes: ['78 card fronts', 'Box label layout', 'CMYK setup notes'],
    templatePrice: TEMPLATE_PRICE,
    printPrice: PRINT_PRICE
  },
  {
    slug: 'archive-serif',
    name: 'Archive Serif',
    description: 'A text-forward system with refined serif labels and clean card indexing.',
    styleNote: 'Ideal for educational or reference-oriented tarot decks.',
    includes: ['78 card fronts', 'Back design variants', 'Ready-to-export package'],
    templatePrice: TEMPLATE_PRICE,
    printPrice: PRINT_PRICE
  }
];

export function getTemplateBySlug(slug: string) {
  return tarotTemplates.find((template) => template.slug === slug);
}
