export type StudioBorderTemplateFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type StudioBorderTemplateConfig = {
  id: string;
  name: string;
  templateId: string;
  frame?: StudioBorderTemplateFrame;
  /** When set, numeral is merged into bottom title for Templated (no separate numeral layer). */
  layout?: 'bottom-combined';
};

/** Templated.io template IDs and optional artwork frame (percent of card) for Studio preview. `id` matches border slug. */
export const STUDIO_BORDER_TEMPLATE_CONFIG: StudioBorderTemplateConfig[] = [
  {
    id: 'steampunk-brass',
    name: 'Steampunk Brass',
    templateId: 'ed5f0989-0f6e-46cd-9698-0d2d13c9fa18',
    frame: {
      left: 10,
      top: 12,
      width: 80,
      height: 70,
    },
  },
  {
    id: 'art-nouveau-lily',
    name: 'Art Nouveau Lily',
    templateId: 'dc2318d8-784d-47c4-9d47-0d4a82e52762',
    frame: {
      left: 10,
      top: 12,
      width: 80,
      height: 70,
    },
  },
  {
    id: 'day-of-the-dead',
    name: 'Day of the Dead',
    templateId: '65d6142f-c577-4564-b1ab-a22234621402',
    frame: { left: 10, top: 12, width: 80, height: 70 },
    layout: 'bottom-combined',
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    templateId: '2b7f5897-f73b-4822-8c60-4ead6d1afa26',
    frame: {
      left: 10,
      top: 10,
      width: 80,
      height: 75,
    },
  },
];
