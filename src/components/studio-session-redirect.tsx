'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function StudioSessionRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/studio/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { deckId?: string } | null) => {
        if (data?.deckId) router.replace(`/studio/${data.deckId}`);
      })
      .catch(() => {});
  }, [sessionId, router]);

  return null;
}

export function StudioSessionRedirect() {
  return (
    <Suspense fallback={null}>
      <StudioSessionRedirectInner />
    </Suspense>
  );
}
