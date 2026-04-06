import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient, createServerClient as createAppServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getSignedCardUrl, getSignedStudioArtworkUrl } from '@/lib/getSignedCardUrl';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

const FALLBACK_BORDER_SLUG = 'default-border';

type SessionCardPayload = {
  card_key: string;
  card_index: number | null;
  card_name: string | null;
  numeral: string | null;
  image_url: string | null;
  artwork_path: string | null;
  rendered_url: string | null;
};

/** Never throws; returns [] if query, RLS, or signing fails. */
async function loadSessionCardsSafe(
  supabase: Awaited<ReturnType<typeof createAppServerClient>>,
  deckId: string,
): Promise<SessionCardPayload[]> {
  try {
    const { data, error } = await supabase
      .from('studio_cards')
      .select('*')
      .eq('deck_id', deckId);

    if (error) {
      console.error('[studio-session] cards error:', error.message, error.code, error.details);
      return [];
    }

    const rawRows = data ?? [];

    try {
      const mapped = await Promise.all(
        rawRows.map(async (row: Record<string, unknown>) => {
          const card_key = String(row.card_key ?? '');
          const card_index =
            typeof row.card_index === 'number'
              ? row.card_index
              : row.card_index != null
                ? Number(row.card_index)
                : null;
          const card_name = row.card_name != null ? String(row.card_name) : null;
          const numeral = row.numeral != null ? String(row.numeral) : null;
          const imageUrlRaw = row.image_url != null ? String(row.image_url) : null;
          const imagePathRaw = row.image_path != null ? String(row.image_path) : null;

          const artwork_path =
            imageUrlRaw && isLikelySupabaseStoragePath(imageUrlRaw) ? imageUrlRaw : null;

          let image_url: string | null = null;
          if (artwork_path) {
            image_url = await getSignedStudioArtworkUrl(artwork_path);
          } else if (imageUrlRaw) {
            image_url = imageUrlRaw;
          }

          let rendered_url: string | null = null;
          if (imagePathRaw && isLikelySupabaseStoragePath(imagePathRaw)) {
            rendered_url = await getSignedCardUrl(imagePathRaw);
          }

          return {
            card_key,
            card_index: Number.isFinite(card_index as number) ? (card_index as number) : null,
            card_name,
            numeral,
            image_url,
            artwork_path,
            rendered_url,
          };
        }),
      );
      return mapped;
    } catch (mapErr) {
      console.error('[studio-session] cards sign/map crash:', mapErr);
      return [];
    }
  } catch (err) {
    console.error('[studio-session] cards crash:', err);
    return [];
  }
}

/**
 * POST { borderSlug } — fetch or create the user's single studio deck; returns deckId + saved cards.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAppServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[studio-session] auth error:', userError);
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('[studio-session] user:', user.id);

    let body: { borderSlug?: string };
    try {
      body = (await request.json()) as { borderSlug?: string };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const borderSlug = String(body.borderSlug ?? '').trim();
    const borderSlugForDb = borderSlug || FALLBACK_BORDER_SLUG;

    const { data: decks, error: fetchError } = await supabase
      .from('studio_decks')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (fetchError) {
      console.error('[studio-session] fetch error:', fetchError.message, fetchError.code, fetchError.details);
      return new Response('Failed to fetch deck', { status: 500 });
    }

    const existingDeck = decks?.[0];
    let deckId: string;

    if (existingDeck) {
      console.log('[studio-session] using existing deck:', existingDeck.id);

      if (borderSlugForDb !== existingDeck.border_slug) {
        const { error: updateError } = await supabase
          .from('studio_decks')
          .update({
            border_slug: borderSlugForDb,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDeck.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('[studio-session] border update error:', updateError.message, updateError.code);
          return new Response('Failed to update deck', { status: 500 });
        }
      }

      deckId = existingDeck.id;
    } else {
      console.log('[studio-session] incoming borderSlug:', body.borderSlug);

      const { data: newDeck, error: insertError } = await supabase
        .from('studio_decks')
        .insert({
          user_id: user.id,
          border_slug: borderSlugForDb,
        })
        .select()
        .single();

      if (insertError || !newDeck) {
        console.error('[studio-session] insert error:', insertError?.message, insertError?.code, insertError?.details);
        return new Response('Failed to create deck', { status: 500 });
      }

      console.log('[studio-session] created deck:', newDeck.id);
      deckId = newDeck.id;
    }

    const cards = await loadSessionCardsSafe(supabase, deckId);

    return NextResponse.json({
      deckId,
      cards,
    });
  } catch (e) {
    console.error('[studio-session] unhandled:', e);
    return new Response('Internal server error', { status: 500 });
  }
}

/** GET ?session_id=cs_xxx — returns { deckId } for Stripe checkout success redirect. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
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
    },
  );
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', session.user.id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('purchase_id', purchase.id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!deck?.id) {
    return NextResponse.json({ deckId: null as string | null });
  }

  return NextResponse.json({ deckId: deck.id });
}
