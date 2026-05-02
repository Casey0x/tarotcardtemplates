'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

/** Detect stale/broken refresh tokens so we can clear cookies and stop noisy AuthApi errors. */
function shouldClearStaleSession(message: string | undefined): boolean {
  const m = message?.toLowerCase() ?? '';
  return m.includes('refresh token') || m.includes('invalid jwt') || m.includes('jwt expired');
}

/**
 * Clears invalid Supabase browser sessions (e.g. missing/expired refresh token) so the client
 * falls back to signed-out/anonymous instead of throwing on every load.
 */
export function SupabaseAuthRecovery() {
  useEffect(() => {
    const supabase = createClient();

    void supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error && shouldClearStaleSession(error.message)) {
          void supabase.auth.signOut();
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (shouldClearStaleSession(msg)) {
          void supabase.auth.signOut();
        }
      });
  }, []);

  return null;
}
