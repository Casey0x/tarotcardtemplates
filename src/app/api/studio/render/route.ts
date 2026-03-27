import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const apiKey = process.env.TEMPLATED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Render not configured' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { deckId, cardId, artworkUrl, cardName, numeral, templateId } = body as Record<string, string>;
  if (!deckId || !cardId || !artworkUrl || templateId === undefined) {
    return NextResponse.json({ error: 'Missing deckId, cardId, artworkUrl, or templateId' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: deck, error: deckErr } = await supabase
    .from('decks')
    .select('id, user_id')
    .eq('id', deckId)
    .single();

  if (deckErr || !deck || deck.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Deck not found or access denied' }, { status: 403 });
  }

  const payload = {
    format: 'png',
    template: templateId,
    layers: {
      'card-artwork': {
        image_url: artworkUrl,
      },
      'card-title': {
        text: cardName || '',
      },
      'card-numeral': {
        text: numeral || '',
      },
    },
  };

  const response = await fetch('https://api.templated.io/v1/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TEMPLATED_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Templated render] failure', {
      status: response.status,
      statusText: response.statusText,
      body: errText,
      cardId,
      deckId,
    });
    return NextResponse.json(
      { error: 'Render failed', detail: errText },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { download_url?: string; render_url?: string };
  const downloadUrl = data.download_url ?? data.render_url;
  if (!downloadUrl) {
    console.error('[Templated render] response missing download_url/render_url', { data, cardId, deckId });
    return NextResponse.json({ error: 'No download_url in response' }, { status: 502 });
  }

  const { error: updateCardErr } = await supabase
    .from('cards')
    .update({
      artwork_url: artworkUrl,
      card_name: cardName ?? null,
      numeral: numeral ?? null,
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

  console.log('[Templated render] success', { cardId, deckId, renderUrl: downloadUrl });
  return NextResponse.json({ renderUrl: downloadUrl });
}
