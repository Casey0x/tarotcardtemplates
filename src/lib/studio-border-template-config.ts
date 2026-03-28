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
];
