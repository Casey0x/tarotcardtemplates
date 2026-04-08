import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient, createServerClient as createAppServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getSignedCardUrl, getSignedStudioArtworkUrl } from '@/lib/getSignedCardUrl';
import { isLikelySupabaseStoragePath } from '@/lib/studio-storage-path';

type SessionCardPayload = {
  card_key: string;
  card_index: number | null;
  card_name: string | null;
  numeral: string | null;
  image_url: string | null;
  artwork_path: string | null;
  artwork_id: string | null;
  rendered_url: string | null;
};

/** Never throws; returns [] if query, RLS, or signing fails. */
async function loadSessionCardsSafe(
  supabase: Awaited<ReturnType<typeof createAppServerClient>> | ReturnType<typeof createServiceClient>,
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
          const card_index =
            typeof row.card_index === 'number'
              ? row.card_index
              : row.card_index != null
                ? Number(row.card_index)
                : null;
          const card_key =
            row.card_key != null && String(row.card_key).length > 0
              ? String(row.card_key)
              : Number.isFinite(card_index as number)
                ? String(card_index as number)
                : '';
          const card_name = row.card_name != null ? String(row.card_name) : null;
          const numeral = row.numeral != null ? String(row.numeral) : null;
          const imageUrlRaw = row.image_url != null ? String(row.image_url) : null;
          const imagePathRaw = row.image_path != null ? String(row.image_path) : null;
          const artworkIdRaw = row.artwork_id != null ? String(row.artwork_id) : null;

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
            artwork_id: artworkIdRaw && artworkIdRaw.length > 0 ? artworkIdRaw : null,
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

function normalizeBorderSlug(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

async function getAuthedUser() {
  const supabase = await createAppServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  return { supabase, user, userError };
}

/**
 * GET — load the user's studio deck and cards; does not create a deck or change `border_slug`.
 * When `?session_id=` is present, returns legacy purchase `deckId` for Stripe redirect (unchanged).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  if (sessionId) {
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

  try {
    const { user, userError } = await getAuthedUser();
    if (userError || !user) {
      console.error('[studio-session] GET auth error:', userError);
      return new Response('Unauthorized', { status: 401 });
    }

    const admin = createServiceClient();
    const { data: decks, error: fetchError } = await admin
      .from('studio_decks')
      .select('id, border_slug')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('[studio-session] GET fetch error:', fetchError.message, fetchError.code);
      return new Response('Failed to fetch deck', { status: 500 });
    }

    const existingDeck = decks?.[0];
    if (!existingDeck?.id) {
      return NextResponse.json({
        deck: null as { id: string; borderSlug: string | null } | null,
        cards: [] as SessionCardPayload[],
      });
    }

    const borderSlug =
      existingDeck.border_slug != null && String(existingDeck.border_slug).trim().length > 0
        ? String(existingDeck.border_slug).trim()
        : null;

    const cards = await loadSessionCardsSafe(admin, existingDeck.id);

    return NextResponse.json({
      deck: { id: existingDeck.id, borderSlug },
      cards,
    });
  } catch (e) {
    console.error('[studio-session] GET unhandled:', e);
    return new Response('Internal server error', { status: 500 });
  }
}

type SessionBody = {
  intent?: string;
  borderSlug?: string;
  confirmClearRenders?: boolean;
};

/**
 * POST
 * - { intent: 'start', borderSlug } — create deck or set border when none set yet (first-time setup).
 * - { intent: 'changeBorder', borderSlug, confirmClearRenders?: boolean } — change deck border;
 *   if any card has a stored render (`image_path`), require `confirmClearRenders: true` or response includes `needsConfirm`.
 *   Renders are not cleared server-side; the client re-renders each card with artwork via `/api/studio/render`.
 */
export async function POST(request: Request) {
  try {
    const { user, userError } = await getAuthedUser();
    if (userError || !user) {
      console.error('[studio-session] POST auth error:', userError);
      return new Response('Unauthorized', { status: 401 });
    }

    let body: SessionBody;
    try {
      body = (await request.json()) as SessionBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const intentRaw = typeof body.intent === 'string' ? body.intent.trim() : '';
    const borderSlug = normalizeBorderSlug(body.borderSlug);
    const admin = createServiceClient();

    const { data: decks, error: fetchError } = await admin
      .from('studio_decks')
      .select('id, border_slug')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('[studio-session] POST fetch error:', fetchError.message, fetchError.code);
      return new Response('Failed to fetch deck', { status: 500 });
    }

    const existingDeck = decks?.[0];

    let effectiveIntent = intentRaw;
    if (!effectiveIntent) {
      if (!borderSlug) {
        return NextResponse.json({ error: 'Missing intent or borderSlug' }, { status: 400 });
      }
      effectiveIntent = 'start';
    }

    if (effectiveIntent === 'start') {
      if (!borderSlug) {
        return NextResponse.json({ error: 'Missing borderSlug' }, { status: 400 });
      }

      let deckId: string;

      if (existingDeck) {
        const current =
          existingDeck.border_slug != null && String(existingDeck.border_slug).trim().length > 0
            ? String(existingDeck.border_slug).trim()
            : null;

        if (current && current !== borderSlug) {
          const cards = await loadSessionCardsSafe(admin, existingDeck.id);
          console.warn('[studio-session] start: border mismatch; returning current deck', {
            requested: borderSlug,
            current,
          });
          return NextResponse.json({
            deckId: existingDeck.id,
            borderSlug: current,
            cards,
            borderMismatch: true,
            message: 'Deck already has a border — use Change border to switch.',
          });
        }

        if (!current) {
          const { error: updateError } = await admin
            .from('studio_decks')
            .update({
              border_slug: borderSlug,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingDeck.id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[studio-session] start update error:', updateError.message);
            return new Response('Failed to update deck', { status: 500 });
          }
        }

        deckId = existingDeck.id;
      } else {
        const { data: newDeck, error: insertError } = await admin
          .from('studio_decks')
          .insert({
            user_id: user.id,
            border_slug: borderSlug,
          })
          .select('id')
          .single();

        if (insertError || !newDeck?.id) {
          console.error('[studio-session] insert error:', insertError?.message, insertError?.code);
          return new Response('Failed to create deck', { status: 500 });
        }

        deckId = newDeck.id;
      }

      const cards = await loadSessionCardsSafe(admin, deckId);
      return NextResponse.json({
        deckId,
        borderSlug,
        cards,
      });
    }

    if (effectiveIntent === 'changeBorder') {
      if (!borderSlug) {
        return NextResponse.json({ error: 'Missing borderSlug' }, { status: 400 });
      }
      if (!existingDeck?.id) {
        return NextResponse.json({ error: 'No deck to update' }, { status: 400 });
      }

      const deckId = existingDeck.id;
      const currentSlug =
        existingDeck.border_slug != null && String(existingDeck.border_slug).trim().length > 0
          ? String(existingDeck.border_slug).trim()
          : null;

      if (currentSlug === borderSlug) {
        const cards = await loadSessionCardsSafe(admin, deckId);
        return NextResponse.json({
          deckId,
          borderSlug,
          cards,
          clearedRenders: false,
        });
      }

      const { count, error: countError } = await admin
        .from('studio_cards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deckId)
        .not('image_path', 'is', null);

      if (countError) {
        console.error('[studio-session] changeBorder count error:', countError.message);
        return new Response('Failed to count rendered cards', { status: 500 });
      }

      const completedRenders = count ?? 0;
      if (completedRenders > 0 && !body.confirmClearRenders) {
        return NextResponse.json({
          needsConfirm: true,
          error: 'CONFIRM_CLEAR_RENDERS',
          completedRenders,
          message:
            'Changing your border will re-render every card that has artwork. Confirm to apply the new border.',
        });
      }

      const { error: updateDeckErr } = await admin
        .from('studio_decks')
        .update({
          border_slug: borderSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (updateDeckErr) {
        console.error('[studio-session] changeBorder deck update:', updateDeckErr.message);
        return new Response('Failed to update deck border', { status: 500 });
      }

      const cards = await loadSessionCardsSafe(admin, deckId);
      return NextResponse.json({
        deckId,
        borderSlug,
        cards,
        clearedRenders: false,
      });
    }

    return NextResponse.json({ error: 'Unknown intent' }, { status: 400 });
  } catch (e) {
    console.error('[studio-session] POST unhandled:', e);
    return new Response('Internal server error', { status: 500 });
  }
}
