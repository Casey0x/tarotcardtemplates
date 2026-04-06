import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { getSignedCardUrl } from '@/lib/getSignedCardUrl';
import { StudioProjectsSessionGate } from '@/components/studio-projects-session-gate';
import { StudioProjectsDevDeckButton } from '@/components/studio-projects-dev-deck-button';

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

  const { data: decks } = await supabase
    .from('studio_decks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const deckRows = (decks ?? []) as StudioDeckRow[];

  const decksWithPreview = await Promise.all(
    deckRows.map(async (deck) => {
      const { data: cards } = await supabase
        .from('studio_cards')
        .select('*')
        .eq('deck_id', deck.id)
        .order('card_index', { ascending: true, nullsFirst: true });

      const previewCard = cards?.find((c) => c.image_path) ?? cards?.[0];
      const previewUrl = previewCard?.image_path
        ? await getSignedCardUrl(previewCard.image_path as string)
        : null;

      return { deck, previewUrl };
    }),
  );

  if (sessionId) {
    return (
      <StudioProjectsSessionGate sessionId={sessionId}>
        <ProjectsInner decksWithPreview={decksWithPreview} />
      </StudioProjectsSessionGate>
    );
  }

  return <ProjectsInner decksWithPreview={decksWithPreview} />;
}

function ProjectsInner({
  decksWithPreview,
}: {
  decksWithPreview: Array<{ deck: StudioDeckRow; previewUrl: string | null }>;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-6 text-sm text-charcoal/70">
        <Link href="/studio" className="underline underline-offset-2 hover:no-underline">
          ← Back to border preview
        </Link>
      </p>
      <h1 className="text-3xl font-semibold text-charcoal">Studio</h1>
      <p className="mt-2 text-charcoal/70">Your deck projects. Pick one to continue designing.</p>
      {decksWithPreview.length === 0 ? (
        <div className="mt-10 rounded-sm border border-charcoal/10 bg-cardBg p-8 text-center text-charcoal/70">
          {process.env.NODE_ENV === 'development' ? (
            <div className="not-prose mb-8">
              <StudioProjectsDevDeckButton />
            </div>
          ) : null}
          <p className="text-lg font-medium text-charcoal">Start your first deck</p>
          <p className="mt-2">
            Open{' '}
            <Link
              href="/studio"
              className="text-charcoal underline underline-offset-2 hover:no-underline"
            >
              Studio
            </Link>
            , choose a border, and your project will show up here.
          </p>
          <p className="mt-4">
            <Link href="/borders" className="text-charcoal underline underline-offset-2 hover:no-underline">
              Browse borders
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {decksWithPreview.map(({ deck, previewUrl }) => (
            <li key={deck.id}>
              <Link
                href={`/studio?border=${encodeURIComponent(deck.border_slug)}`}
                className="flex gap-4 rounded-sm border border-charcoal/10 bg-cardBg p-4 text-charcoal transition hover:border-charcoal/20"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-20 w-14 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <div className="h-20 w-14 shrink-0 rounded-sm bg-charcoal/5" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{deck.border_slug}</span>
                  <span className="mt-1 block text-sm text-charcoal/70">
                    Last updated {formatUpdatedAt(deck.updated_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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
