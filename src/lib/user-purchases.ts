import { createClient } from '@/lib/supabase-server';

/**
 * Border slugs the current user has paid for (`purchases` table, Stripe webhook).
 * Returns [] if not signed in or on error.
 */
export async function fetchPurchasedBorderSlugsForUser(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('purchases')
    .select('border_slug')
    .eq('user_id', user.id)
    .eq('status', 'paid');

  if (error) {
    console.warn('fetchPurchasedBorderSlugsForUser:', error.message);
    return [];
  }

  const rows = data as { border_slug: string }[] | null;
  return [...new Set((rows ?? []).map((r) => r.border_slug).filter(Boolean))];
}

export type PurchaseRow = {
  border_slug: string;
  border_name: string;
  created_at: string;
};

/** Purchased borders for dashboard (deduped by slug, latest first). */
export async function fetchPurchasedBordersForUser(): Promise<PurchaseRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('purchases')
    .select('border_slug, border_name, created_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchPurchasedBordersForUser:', error.message);
    return [];
  }

  const rows = (data ?? []) as PurchaseRow[];
  const seen = new Set<string>();
  const out: PurchaseRow[] = [];
  for (const r of rows) {
    if (!r.border_slug || seen.has(r.border_slug)) continue;
    seen.add(r.border_slug);
    out.push(r);
  }
  return out;
}
