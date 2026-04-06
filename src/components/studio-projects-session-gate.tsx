'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** After Stripe checkout, resolve purchase deck id then redirect away from session_id URL. */
export function StudioProjectsSessionGate({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/studio/session?session_id=${encodeURIComponent(sessionId)}`);
      const data = res.ok ? ((await res.json()) as { deckId?: string | null }) : null;
      if (cancelled) return;
      if (data?.deckId) {
        router.replace(`/studio/${data.deckId}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return <>{children}</>;
}
