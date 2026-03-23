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
      'The Celestial Gilded tarot card border template features elegant gold linework inspired by celestial symbols such as stars, moons, and cosmic ornament. The decorative frame surrounds your artwork while leaving a transparent center window for your tarot illustration.\n\nDesigned for standard tarot card proportions, the template works seamlessly in Canva or Photoshop. Simply place your artwork inside the frame, add card names and numerals, and export your cards as print-ready tarot files.\n\nThis border style works especially well for astrology-inspired decks, cosmic tarot themes, or spiritual artwork where celestial symbolism enhances the card design.',
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
    slug: 'steampunk-brass',
    name: 'Steampunk Brass Border',
    description:
      'Ornate steampunk tarot border with brass gears, gauges, and mechanical detailing.',
    productDescription:
      'This intricately detailed steampunk tarot card border features an ornate brass and bronze mechanical frame with interlocking gears, industrial rivets, pressure gauges, and weathered metallic textures that evoke Victorian-era craftsmanship. The symmetrical design includes decorative text panels at the top and bottom, perfect for card titles and descriptions, while the generous central space accommodates your custom artwork or imagery.\n\nDesigned to work seamlessly with standard tarot card proportions, this border pairs perfectly with Canva or Photoshop. Place your illustration inside the frame, add card names and numerals into the brass title plates, and export your cards as print-ready files.\n\nIdeal for creating distinctive steampunk tarot decks, oracle cards, trading card games, certificates, event graphics, or any project requiring an elaborate antique industrial aesthetic with rich warm metallics and authentic aged patina effects.',
    image: '/images/templates/steampunk-brass-tarot-border-cream.png',
  },
  {
    slug: 'japanese-zen',
    name: 'Japanese Zen Border',
    description:
      'Serene Japanese-inspired tarot border with cherry blossoms, bamboo, clouds, and seigaiha waves on warm cream.',
    productDescription:
      'This serene Japanese-inspired tarot card border features delicate hand-painted elements including soft pink cherry blossoms, elegant bamboo stalks, wispy watercolor clouds, and traditional seigaiha wave patterns that evoke tranquility and natural harmony. The minimalist design on a warm cream background includes a decorative scroll banner at the top for card titles and a larger unfurled scroll at the bottom for descriptions or meanings, while the generous central space accommodates your custom artwork.\n\nPerfect for creating Zen-themed tarot decks, mindfulness oracle cards, meditation guides, Japanese tea ceremony materials, wellness journals, spa menus, yoga studio graphics, or any project requiring an authentic East Asian aesthetic with gentle, contemplative beauty that embodies the principles of wabi-sabi and balanced simplicity.',
    image: '/images/templates/japanese-zen-tarot-border-cream.png',
  },
  {
    slug: 'enchanted-forest',
    name: 'Enchanted Forest Border',
    description:
      'Magical woodland tarot border with twisted vines, oak leaves, acorns, moss, and glowing fireflies on deep green.',
    productDescription:
      'This magical woodland tarot card border features intricately twisted vines and roots that form an organic frame against a rich, textured deep green background, adorned with realistic oak leaves, acorns, delicate moss, and enchanting glowing firefly lights that create an ethereal atmosphere. The design includes a rustic wooden plaque at the top perfect for card titles and a larger weathered wooden plank at the bottom for descriptions or meanings, while the generous central black space accommodates your custom artwork.\n\nIdeal for creating nature-themed tarot decks, druid oracle cards, forest fairy tales, Celtic spirituality materials, fantasy gaming cards, botanical guides, eco-retreat branding, woodland wedding invitations, fairy tale book illustrations, or any project requiring an authentic enchanted forest aesthetic with earthy browns, luminous greens, and mystical natural elements that evoke ancient groves and woodland magic.',
    image: '/images/templates/enchanted-forest-tarot-border-cream.png',
  },
  {
    slug: 'day-of-the-dead',
    name: 'Day of the Dead Border',
    description:
      'Vibrant Día de los Muertos tarot border with sugar skulls, marigolds, and papel picado.',
    productDescription:
      'This vibrant Día de los Muertos tarot card border celebrates Mexican folk art tradition with intricately decorated sugar skulls (calaveras), brilliant orange marigold flowers (cempasúchil), festive papel picado banners in hot pink, golden crosses, and a rich deep purple background adorned with colorful confetti dots and turquoise leaves.\n\nThe joyful design features decorative banner spaces at the top and bottom perfect for card titles and meanings, while the generous central black area accommodates your custom artwork. Ideal for creating Day of the Dead tarot decks, ancestral oracle cards, cultural celebration materials, Mexican heritage projects, memorial cards, festival invitations, restaurant menus for Día de los Muertos events, altar decorations, or any project requiring an authentic, spirited aesthetic that honors the beautiful tradition of remembering loved ones with vibrant colors, marigolds, and the celebratory symbolism of life, death, and eternal memory.',
    image: '/images/templates/day-of-the-dead-tarot-border-cream.png',
  },
  {
    slug: 'ocean-mermaid',
    name: 'Ocean Depths Border',
    description:
      'Underwater tarot card border with seaweed ribbons, coral branches, pearls and shells.',
    productDescription:
      'This enchanting underwater tarot card border features flowing turquoise seaweed ribbons, delicate coral pink sea branches, lustrous pearls, elegant scallop and spiral shells, vibrant orange starfish, and shimmering bubbles against a deep ocean black background that captures the mystery of the sea. The design includes elegant golden metallic plaques at the top and bottom perfect for card titles and descriptions, while the generous central space accommodates your custom artwork.\n\nIdeal for creating mermaid-themed tarot decks, ocean oracle cards, nautical divination tools, beach resort branding, marine biology educational materials, aquarium gift shop items, coastal wedding invitations, sea goddess spirituality guides, tropical vacation promotions, or any project requiring an authentic underwater aesthetic with jewel-toned aquas, soft corals, and luminous golden accents that evoke the serene beauty and magical depths of the ocean realm.',
    image: '/images/templates/ocean-mermaid-tarot-border-cream.png',
  },
  {
    slug: 'dragon-scale',
    name: 'Dragon Scale Border',
    description:
      'Dramatic fantasy tarot border with layered dragon scales, weathered bronze plaques and armored spikes.',
    productDescription:
      'This dramatic fantasy tarot card border features intricately layered dragon scales in deep charcoal gray and black that create a powerful armored texture, complete with sharp protective spikes emerging from the sides and ornate weathered bronze metallic plaques at the top and bottom framed by elegant scrollwork flourishes. The fierce design includes decorative banner spaces perfect for card titles and descriptions with an aged, battle-worn patina, while the generous central transparent area accommodates your custom artwork.\n\nIdeal for creating dragon-themed tarot decks, fantasy game cards, medieval oracle decks, Game of Thrones-inspired materials, dungeon master resources, role-playing game accessories, fantasy novel covers, warrior-themed invitations, gothic event graphics, or any project requiring an epic, mythical aesthetic with dark metallics, reptilian textures, and the commanding presence of ancient dragons that evokes power, protection, and legendary fire-breathing mystique.',
    image: '/images/templates/dragon-scale-tarot-border.png',
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
