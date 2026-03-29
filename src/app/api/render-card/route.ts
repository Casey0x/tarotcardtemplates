import { STUDIO_BORDER_TEMPLATE_CONFIG } from '@/lib/studio-border-template-config';
import { createClient, createServiceClient } from '@/lib/supabase-server';

const TEMPLATE_ID = '669959c5-4cca-476b-a484-5a9b1158e2a4';
const TEMPLATED_RENDER_URL = 'https://api.templated.io/v1/render';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TEMPLATED_API_KEY;
    if (!apiKey) {
      console.error(new Error('TEMPLATED_API_KEY is not set'));
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Sign in to render preview cards.' }, { status: 401 });
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

    const borderId = typeof border_id === 'string' && border_id.trim() ? border_id.trim() : undefined;
    if (!borderId) {
      return Response.json({ error: 'Missing border' }, { status: 400 });
    }

    const { data: purchaseRows } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('border_slug', borderId)
      .eq('status', 'paid')
      .limit(1);

    const ownsBorder = (purchaseRows?.length ?? 0) > 0;

    if (!ownsBorder) {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('trial_renders_used')
        .eq('id', user.id)
        .maybeSingle();

      if (profErr) {
        console.warn('render-card profiles read:', profErr.message);
      }

      const used = (prof as { trial_renders_used?: number } | null)?.trial_renders_used ?? 0;
      if (used >= 2) {
        return Response.json(
          { error: 'Free trial limit reached. Purchase this border to continue.' },
          { status: 403 }
        );
      }
    }

    const templateForBorder = STUDIO_BORDER_TEMPLATE_CONFIG.find((c) => c.id === borderId);
    const resolvedTemplateId = templateForBorder?.templateId ?? TEMPLATE_ID;

    const bottomCombined = templateForBorder?.layout === 'bottom-combined';
    const combinedName = numeral ? `${numeral} ${card_name}` : card_name;

    const layers = bottomCombined
      ? {
          artwork: {
            image_url: artwork,
          },
          card_name: {
            text: combinedName,
          },
        }
      : {
          artwork: {
            image_url: artwork,
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

    if (!templatedRes.ok) {
      console.error(new Error(`Templated.io render failed: ${templatedRes.status}`), data);
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    const image_url = data.render_url || data.url || data.image_url;
    if (!image_url || typeof image_url !== 'string') {
      console.error(new Error('Templated.io response missing image URL'), data);
      return Response.json({ error: 'Failed to render card' }, { status: 500 });
    }

    let trialRendersUsed: number | undefined;
    if (!ownsBorder) {
      try {
        const admin = createServiceClient();
        const { data: existing } = await admin
          .from('profiles')
          .select('trial_renders_used')
          .eq('id', user.id)
          .maybeSingle();
        const current = (existing as { trial_renders_used?: number } | null)?.trial_renders_used ?? 0;
        const next = current + 1;
        const { error: upErr } = await admin.from('profiles').upsert(
          { id: user.id, trial_renders_used: next, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
        if (upErr) {
          console.error('render-card trial increment:', upErr);
          return Response.json({ error: 'Failed to record trial usage' }, { status: 500 });
        }
        trialRendersUsed = next;
      } catch (e) {
        console.error('render-card service client:', e);
        return Response.json({ error: 'Failed to record trial usage' }, { status: 500 });
      }
    }

    return Response.json({
      image_url,
      ...(trialRendersUsed !== undefined ? { trial_renders_used: trialRendersUsed } : {}),
    });
  } catch (error) {
    console.error('Render error:', error);
    return Response.json({ error: 'Failed to render card' }, { status: 500 });
  }
}
