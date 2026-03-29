import { createClient } from '@/lib/supabase-server';

/** Free Studio renders used (Supabase `profiles.trial_renders_used`). 0 if logged out or missing. */
export async function fetchTrialRendersUsedForUser(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('profiles')
    .select('trial_renders_used')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('fetchTrialRendersUsedForUser:', error.message);
    return 0;
  }

  const row = data as { trial_renders_used?: number } | null;
  return typeof row?.trial_renders_used === 'number' ? row.trial_renders_used : 0;
}
