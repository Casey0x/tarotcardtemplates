import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { STUDIO_BORDER_TEMPLATE_CONFIG } from '@/lib/studio-border-template-config';

const TEMPLATE_ID = '669959c5-4cca-476b-a484-5a9b1158e2a4';
const TEMPLATED_RENDER_URL = 'https://api.templated.io/v1/render';

async function renderWithTemplated(params: {
  borderId: string;
  artwork: string;
  card_name: string;
  numeral: string;
  apiKey: string;
}): Promise<{ ok: true; imageUrl: string } | { ok: false; status: number; detail: string }> {
  const { borderId, artwork, card_name, numeral, apiKey } = params;

  const templateForBorder = STUDIO_BORDER_TEMPLATE_CONFIG.find((c) => c.id === borderId);
  const resolvedTemplateId = templateForBorder?.templateId ?? TEMPLATE_ID;

  const bottomCombined = templateForBorder?.layout === 'bottom-combined';
  const combinedName = numeral ? `${numeral} ${card_name}` : card_name;

  const layers = bottomCombined
    ? {
        artwork: { image_url: artwork },
        card_name: { text: combinedName },
      }
    : {
        artwork: { image_url: artwork },
        card_name: { text: card_name },
        numeral: { text: numeral },
      };

  const templatedRes = await fetch(TEMPLATED_RENDER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template: resolvedTemplateId, layers }),
  });

  const data = (await templatedRes.json()) as {
    render_url?: string;
    url?: string;
    image_url?: string;
    download_url?: string;
  };

  if (!templatedRes.ok) {
    const detail = typeof data === 'object' ? JSON.stringify(data) : await templatedRes.text();
    return { ok: false, status: 502, detail };
  }

  const imageUrl =
    data.render_url || data.url || data.image_url || data.download_url;
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { ok: false, status: 502, detail: 'Templated response missing image URL' };
  }

  return { ok: true, imageUrl };
}

export async function POST(request: Request) {
  const apiKey = process.env.TEMPLATED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Render not configured' }, { status: 500 });
  }

  const supabaseAuth = await createServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const deckId = typeof body.deckId === 'string' ? body.deckId.trim() : '';
  if (!deckId) {
    return NextResponse.json({ error: 'Missing deckId' }, { status: 400 });
  }

  const studioDeck = await supabase
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (studioDeck.data) {
    const cardIndexRaw = body.cardIndex;
    const cardIndex =
      typeof cardIndexRaw === 'number'
        ? cardIndexRaw
        : typeof cardIndexRaw === 'string'
          ? parseInt(cardIndexRaw, 10)
          : NaN;
    const artwork = typeof body.artwork === 'string' ? body.artwork : '';
    const card_name = typeof body.card_name === 'string' ? body.card_name : '';
    const numeral = typeof body.numeral === 'string' ? body.numeral : '';
    const border_id = typeof body.border_id === 'string' ? body.border_id.trim() : '';

    if (!Number.isFinite(cardIndex) || cardIndex < 0 || cardIndex > 77) {
      return NextResponse.json({ error: 'Invalid cardIndex' }, { status: 400 });
    }
    if (!artwork || !card_name.trim() || !border_id) {
      return NextResponse.json({ error: 'Missing artwork, card_name, or border_id' }, { status: 400 });
    }

    const rendered = await renderWithTemplated({
      borderId: border_id,
      artwork,
      card_name,
      numeral,
      apiKey,
    });

    if (!rendered.ok) {
      console.error('[studio/render] templated', rendered);
      return NextResponse.json({ error: 'Render failed', detail: rendered.detail }, { status: rendered.status });
    }

    const imageRes = await fetch(rendered.imageUrl);
    if (!imageRes.ok) {
      console.error('[studio/render] fetch rendered png', imageRes.status);
      return NextResponse.json({ error: 'Failed to fetch rendered image' }, { status: 502 });
    }
    const imageBuffer = await imageRes.arrayBuffer();

    const filePath = `${user.id}/${deckId}/card-${cardIndex}.png`;

    const { error: uploadError } = await supabase.storage
      .from('studio-renders')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to store render' }, { status: 500 });
    }

    const { error: upsertErr } = await supabase.from('studio_cards').upsert(
      {
        deck_id: deckId,
        user_id: user.id,
        card_index: cardIndex,
        card_key: String(cardIndex),
        card_name,
        numeral: numeral || null,
        image_path: filePath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'deck_id,card_index' },
    );

    if (upsertErr) {
      console.error('[studio/render] studio_cards upsert', upsertErr);
      return NextResponse.json({ error: 'Failed to save card record' }, { status: 500 });
    }

    await supabase
      .from('studio_decks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', deckId)
      .eq('user_id', user.id);

    const { data: signed, error: signErr } = await supabase.storage
      .from('studio-renders')
      .createSignedUrl(filePath, 300);

    if (signErr || !signed?.signedUrl) {
      console.error('[studio/render] sign', signErr);
      return NextResponse.json({ error: 'Render saved but could not sign URL' }, { status: 500 });
    }

    return NextResponse.json({ renderUrl: signed.signedUrl, image_url: signed.signedUrl });
  }

  const cardId = typeof body.cardId === 'string' ? body.cardId.trim() : '';
  const artworkUrl = typeof body.artworkUrl === 'string' ? body.artworkUrl : '';
  const templateId = typeof body.templateId === 'string' ? body.templateId : '';
  const cardName = typeof body.cardName === 'string' ? body.cardName : '';
  const numeralLegacy = typeof body.numeral === 'string' ? body.numeral : '';

  if (!cardId || !artworkUrl || !templateId) {
    return NextResponse.json({ error: 'Missing cardId, artworkUrl, or templateId' }, { status: 400 });
  }

  const { data: deck, error: deckErr } = await supabase
    .from('decks')
    .select('id, user_id')
    .eq('id', deckId)
    .single();

  if (deckErr || !deck || deck.user_id !== user.id) {
    return NextResponse.json({ error: 'Deck not found or access denied' }, { status: 403 });
  }

  const payload = {
    format: 'png' as const,
    template: templateId,
    layers: {
      'card-artwork': { image_url: artworkUrl },
      'card-title': { text: cardName || '' },
      'card-numeral': { text: numeralLegacy || '' },
    },
  };

  const response = await fetch('https://api.templated.io/v1/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Templated render] failure', {
      status: response.status,
      body: errText,
      cardId,
      deckId,
    });
    return NextResponse.json({ error: 'Render failed', detail: errText }, { status: 502 });
  }

  const data = (await response.json()) as { download_url?: string; render_url?: string };
  const downloadUrl = data.download_url ?? data.render_url;
  if (!downloadUrl) {
    return NextResponse.json({ error: 'No download_url in response' }, { status: 502 });
  }

  const { error: updateCardErr } = await supabase
    .from('cards')
    .update({
      artwork_url: artworkUrl,
      card_name: cardName ?? null,
      numeral: numeralLegacy ?? null,
      render_url: downloadUrl,
      status: 'rendered',
    })
    .eq('id', cardId)
    .eq('deck_id', deckId);

  if (updateCardErr) {
    console.error('Card update error', updateCardErr);
    return NextResponse.json({ error: 'Failed to save card' }, { status: 500 });
  }

  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId)
    .eq('status', 'rendered');

  const newCount = count ?? 0;
  await supabase.from('decks').update({ completed_cards: newCount }).eq('id', deckId);

  return NextResponse.json({ renderUrl: downloadUrl });
}
