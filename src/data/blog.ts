export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  dateISO: string;
  readingTime: string;
  category: string;
  keywords: string[];
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'tarot-card-templates-what-to-include-print-ready-checklist',
    title: 'Tarot Card Templates: What to Include (Print-Ready Checklist)',
    excerpt:
      'Use this print-ready checklist to avoid common setup errors before you export your tarot deck files.',
    dateISO: '2026-01-12',
    readingTime: '6 min read',
    category: 'Template Setup',
    keywords: ['tarot card templates', 'print-ready tarot', 'tarot checklist', 'bleed and safe zone'],
    body: [
      'A tarot template should do more than look good. It should reduce mistakes between design and print, especially once you begin preparing a full 78-card deck.',
      'Start with fixed dimensions, bleed, and a safe zone on every card. Add a front/back pairing system, naming conventions, and card numbering so your files stay organized during export.',
      'Before sending files to print, review color mode, image resolution, edge contrast, and text legibility at physical size. A quick checklist can save hours of revisions and re-exports.',
      'If you are selling your deck, consistency is part of quality. A strong template gives every card a unified frame while still leaving room for creative variation.'
    ]
  },
  {
    slug: 'tarot-card-size-guide-standard-dimensions-plus-bleed',
    title: 'Tarot Card Size Guide: Standard Dimensions + Bleed',
    excerpt:
      'A practical guide to common tarot card dimensions, bleed settings, and safe margins for clean cuts.',
    dateISO: '2026-01-16',
    readingTime: '5 min read',
    category: 'Print Specs',
    keywords: ['tarot card size', 'tarot dimensions', 'tarot card bleed', 'print specifications'],
    body: [
      'Tarot decks come in several popular sizes, but most creators choose a standard format to simplify printing and packaging.',
      'Whatever size you choose, include bleed on all sides so background artwork extends past the trim line. This prevents thin white edges after cutting.',
      'Keep symbols, titles, and borders inside a safe zone to avoid accidental trimming. Even professional print runs can have slight movement during finishing.',
      'When in doubt, design with conservative margins and test one card physically. A printed proof reveals proportion issues much faster than screen previews.'
    ]
  },
  {
    slug: 'how-to-print-a-tarot-deck-beginner-friendly-steps',
    title: 'How to Print a Tarot Deck (Beginner-Friendly Steps)',
    excerpt:
      'From files to final proof, follow these beginner-friendly steps to print your first tarot deck with confidence.',
    dateISO: '2026-01-20',
    readingTime: '7 min read',
    category: 'Printing Workflow',
    keywords: ['print tarot deck', 'tarot deck production', 'tarot printing steps', 'tarot proofing'],
    body: [
      'Printing a tarot deck is easier when you break it into stages: setup, export, proofing, and final order.',
      'First, finalize your card fronts and backs in a consistent template. Then export files exactly as your printer requests, including color profile and bleed.',
      'Next, order a small proof run or sample deck. Check card feel, darkness, alignment, and readability under normal lighting before approving a full quantity.',
      'Once the proof looks right, place your production order and keep versioned files archived. This makes future reprints or updates straightforward.'
    ]
  },
  {
    slug: 'best-paper-and-finish-for-tarot-cards-linen-vs-smooth',
    title: 'Best Paper & Finish for Tarot Cards (Linen vs Smooth)',
    excerpt:
      'Compare cardstock weight and finish options to choose the right shuffle feel and visual style for your deck.',
    dateISO: '2026-01-24',
    readingTime: '6 min read',
    category: 'Materials',
    keywords: ['tarot card paper', 'linen finish tarot', 'smooth finish tarot', 'cardstock for tarot'],
    body: [
      'Paper and finish directly affect how your tarot deck handles in real use. Creators often choose between linen texture and smooth stock based on audience preference.',
      'Linen finishes add tactile grip and can hide minor surface scuffs. Smooth finishes usually show artwork detail more sharply and feel cleaner in hand.',
      'Also compare card thickness and core quality, since durability matters for repeated shuffling. A deck that bends too easily may wear out quickly.',
      'If possible, request material samples before committing. Seeing the same artwork on two stocks can clarify which finish best supports your visual style.'
    ]
  },
  {
    slug: 'tarot-deck-printing-costs-what-affects-price',
    title: 'Tarot Deck Printing Costs: What Affects Price?',
    excerpt:
      'Understand the main pricing factors behind tarot deck production so you can budget and price your project responsibly.',
    dateISO: '2026-01-28',
    readingTime: '5 min read',
    category: 'Budgeting',
    keywords: ['tarot printing cost', 'deck production pricing', 'cost to print tarot cards', 'tarot project budget'],
    body: [
      'Tarot printing costs depend on quantity, material choices, packaging, and finishing options. Small changes can noticeably shift your per-deck cost.',
      'Low-volume runs are useful for testing, but unit pricing is higher. Larger runs reduce per-unit cost while increasing upfront investment and storage needs.',
      'Special finishes, custom boxes, and foil accents can elevate presentation but should be weighed against your audience and sales channel.',
      'Build your budget from both production and post-production costs, including shipping, marketplace fees, and replacement inventory for damaged units.'
    ]
  },
  {
    slug: 'how-to-sell-tarot-decks-templates-etsy-and-beyond',
    title: 'How to Sell Tarot Decks: Templates, Etsy, and Beyond',
    excerpt:
      'A practical overview of selling tarot decks online, from template-led production to marketplace and direct sales strategies.',
    dateISO: '2026-02-01',
    readingTime: '8 min read',
    category: 'Selling',
    keywords: ['sell tarot decks', 'etsy tarot deck', 'tarot templates for creators', 'tarot publishing'],
    body: [
      'Selling tarot decks starts with a repeatable production system. Template-based workflows make updates faster and keep design quality consistent.',
      'Many first-time creators launch on Etsy to validate demand, then expand to their own storefront for better branding and customer ownership.',
      'Strong listings need clear photos, material details, card size information, and realistic shipping timelines. Trust grows when buyers know exactly what to expect.',
      'As sales grow, document your workflow for reprints, customer support, and stock tracking. Operational clarity supports better reviews and long-term momentum.'
    ]
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
