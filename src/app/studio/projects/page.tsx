import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { getSignedCardUrl } from '@/lib/getSignedCardUrl';
import { StudioProjectsSessionGate } from '@/components/studio-projects-session-gate';

export const dynamic = 'force-dynamic';

interface StudioDeckRow {
  id: string;
  border_slug: string;
  updated_at: string;
  created_at?: string;
}

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

async function ProjectsList({ sessionId }: { sessionId: string | undefined }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/studio/projects');
  }

  const { data: deck, error: deckErr } = await supabase
    .from('studio_decks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr) {
    console.error('[studio/projects] deck', deckErr);
  }

  const deckRow = deck as StudioDeckRow | null;

  let previewUrl: string | null = null;
  if (deckRow) {
    const { data: cards } = await supabase
      .from('studio_cards')
      .select('*')
      .eq('deck_id', deckRow.id)
      .order('card_index', { ascending: true, nullsFirst: true });

    const previewCard = cards?.find((c) => c.image_path) ?? cards?.[0];
    if (previewCard?.image_path) {
      previewUrl = await getSignedCardUrl(previewCard.image_path as string);
    }
  }

  const inner = (
    <ProjectsInner deck={deckRow} previewUrl={previewUrl} />
  );

  if (sessionId) {
    return <StudioProjectsSessionGate sessionId={sessionId}>{inner}</StudioProjectsSessionGate>;
  }

  return inner;
}

function ProjectsInner({
  deck,
  previewUrl,
}: {
  deck: StudioDeckRow | null;
  previewUrl: string | null;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-6 text-sm text-charcoal/70">
        <Link href="/studio" className="underline underline-offset-2 hover:no-underline">
          ← Back to Studio
        </Link>
      </p>
      <h1 className="text-3xl font-semibold text-charcoal">Your Deck</h1>
      {!deck ? (
        <div className="mt-10 rounded-sm border border-charcoal/10 bg-cardBg p-8 text-center text-charcoal/70">
          <p className="text-lg text-charcoal">You haven&apos;t started a deck yet.</p>
          <p className="mt-6">
            <Link
              href="/studio"
              className="inline-flex rounded-sm border border-charcoal bg-charcoal px-6 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
            >
              Start Designing
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-sm border border-charcoal/10 bg-cardBg p-6 text-charcoal">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="mx-auto h-40 w-[5.5rem] shrink-0 rounded-sm object-cover sm:mx-0"
              />
            ) : (
              <div
                className="mx-auto h-40 w-[5.5rem] shrink-0 rounded-sm bg-charcoal/5 sm:mx-0"
                aria-hidden
              />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-medium capitalize text-charcoal">{deck.border_slug.replace(/-/g, ' ')}</p>
              <p className="mt-1 text-sm text-charcoal/70">Last updated {formatUpdatedAt(deck.updated_at)}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/studio?border=${encodeURIComponent(deck.border_slug)}`}
                  className="inline-flex justify-center rounded-sm border border-charcoal bg-charcoal px-5 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
                >
                  Continue Editing
                </Link>
                <Link
                  href={`/borders/${encodeURIComponent(deck.border_slug)}`}
                  className="inline-flex justify-center rounded-sm border border-charcoal/35 bg-cream px-5 py-2 text-sm font-medium text-charcoal hover:bg-charcoal/5"
                >
                  Print Deck
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioProjectsPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id?.trim() || undefined;
  return (
    <Suspense
      fallback={<div className="text-charcoal"><p className="text-center">Loading…</p></div>}
    >
      <ProjectsList sessionId={sessionId} />
    </Suspense>
  );
}
