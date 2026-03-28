import { STUDIO_BORDER_TEMPLATE_CONFIG } from '@/lib/studio-border-template-config';

const TEMPLATE_ID = '669959c5-4cca-476b-a484-5a9b1158e2a4';
const TEMPLATED_RENDER_URL = 'https://api.templated.io/v1/render';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TEMPLATED_API_KEY;
    if (!apiKey) {
      console.error(new Error('TEMPLATED_API_KEY is not set'));
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    const body = await req.json();
    const { artwork, numeral, card_name, border_id } = body as {
      artwork?: unknown;
      numeral?: unknown;
      card_name?: unknown;
      border_id?: unknown;
    };

    if (
      typeof artwork !== 'string' ||
      typeof numeral !== 'string' ||
      typeof card_name !== 'string'
    ) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const borderId = typeof border_id === 'string' ? border_id : undefined;
    const templateForBorder = borderId
      ? STUDIO_BORDER_TEMPLATE_CONFIG.find((c) => c.id === borderId)
      : undefined;
    const resolvedTemplateId = templateForBorder?.templateId ?? TEMPLATE_ID;

    const bottomCombined = templateForBorder?.layout === 'bottom-combined';
    const combinedName = numeral ? `${numeral} ${card_name}` : card_name;
    const layerStyle = templateForBorder?.layerStyle ?? 'preview';

    const layers = bottomCombined
      ? {
          artwork: {
            image_url: artwork,
          },
          card_name: {
            text: combinedName,
          },
        }
      : layerStyle === 'studio'
        ? {
            'card-artwork': {
              image_url: artwork,
            },
            'card-title': {
              text: card_name,
            },
            'card-numeral': {
              text: numeral,
            },
          }
        : {
            artwork: {
              src: artwork,
              image_url: artwork,
              object_fit: 'cover',
            },
            card_name: {
              text: card_name,
            },
            numeral: {
              text: numeral,
            },
          };

    const templatedRequestBody = {
      template: resolvedTemplateId,
      layers,
    };

    console.log('--- TEMPLATED DEBUG ---');
    console.log('Artwork URL:', artwork);
    console.log('Payload:', JSON.stringify(templatedRequestBody, null, 2));

    const templatedRes = await fetch(TEMPLATED_RENDER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatedRequestBody),
    });

    const data = (await templatedRes.json()) as {
      render_url?: string;
      url?: string;
      image_url?: string;
    };

    console.log('Templated response:', JSON.stringify(data, null, 2));

    if (!templatedRes.ok) {
      console.error(new Error(`Templated.io render failed: ${templatedRes.status}`), data);
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    const image_url = data.render_url || data.url || data.image_url;
    if (!image_url || typeof image_url !== 'string') {
      console.error(new Error('Templated.io response missing image URL'), data);
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    return Response.json({ image_url });
  } catch (error) {
    console.error('Render error:', error);
    return Response.json({ error: 'Failed to render card' }, { status: 500 });
  }
}
