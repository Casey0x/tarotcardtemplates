import { createClient, createServiceClient } from '@/lib/supabase-server';

function parseTrialUsed(row: unknown): number {
  const raw = (row as { trial_renders_used?: number } | null)?.trial_renders_used;
  return typeof raw === 'number' ? raw : 0;
}

function isProfilesTableMissing(err: { message?: string } | null): boolean {
  const m = err?.message?.toLowerCase() ?? '';
  return m.includes('relation') && m.includes('does not exist');
}

/**
 * Authoritative `profiles.trial_renders_used` for this user.
 * Uses the service role first so RLS cannot hide the row (common cause of broken trial limits).
 * Falls back to the cookie-scoped Supabase client if the service role is unavailable.
 */
export async function fetchTrialRendersUsedForUserId(
  userId: string,
  cookieScopedClient: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      const admin = createServiceClient();
      const { data, error } = await admin
        .from('profiles')
        .select('trial_renders_used')
        .eq('id', userId)
        .maybeSingle();

      if (!error) {
        return parseTrialUsed(data);
      }
      if (!isProfilesTableMissing(error)) {
        console.warn('fetchTrialRendersUsedForUserId (service):', error.message);
      }
    } catch (e) {
      console.warn('fetchTrialRendersUsedForUserId (service):', e);
    }
  }

  const { data, error } = await cookieScopedClient
    .from('profiles')
    .select('trial_renders_used')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('fetchTrialRendersUsedForUser (session):', error.message);
    return 0;
  }
  return parseTrialUsed(data);
}

/** Free Studio renders used (`profiles.trial_renders_used`). 0 if logged out or on error. */
export async function fetchTrialRendersUsedForUser(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  return fetchTrialRendersUsedForUserId(user.id, supabase);
}
