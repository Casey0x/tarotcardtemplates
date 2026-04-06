import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { createClient } from '@/lib/supabase-server';

const PAID_TABLES = ['orders', 'purchases'] as const;

async function fetchPaidBorderSlugsFromTable(
  table: (typeof PAID_TABLES)[number],
  userId: string
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select('border_slug')
    .eq('user_id', userId)
    .eq('status', 'paid');

  if (error) {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('relation') && msg.includes('does not exist')) {
      return [];
    }
    console.warn(`fetchPaidBorderSlugsFromTable (${table}):`, error.message);
    return [];
  }

  const rows = data as { border_slug: string }[] | null;
  return (rows ?? []).map((r) => r.border_slug).filter(Boolean);
}

/** Paid border slugs for a known user id (server caching / batch use). */
export async function fetchPurchasedBorderSlugsForUserId(userId: string): Promise<string[]> {
  const merged = new Set<string>();
  for (const table of PAID_TABLES) {
    const slugs = await fetchPaidBorderSlugsFromTable(table, userId);
    for (const s of slugs) merged.add(s);
  }
  return [...merged];
}

/**
 * Border slugs the current user has paid for (`orders` and/or `purchases` tables).
 * Returns [] if not signed in or on error.
 */
export async function fetchPurchasedBorderSlugsForUser(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return fetchPurchasedBorderSlugsForUserId(user.id);
}

/** Whether this user has a paid row for the border (`orders` / `purchases`). */
export async function userOwnsBorderForUserId(userId: string, borderSlug: string): Promise<boolean> {
  const supabase = await createClient();
  for (const table of PAID_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', userId)
      .eq('border_slug', borderSlug)
      .eq('status', 'paid')
      .limit(1);
    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('relation') && msg.includes('does not exist')) continue;
      continue;
    }
    if (data?.length) return true;
  }
  return false;
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

  const { data: purchaseRows, error: purchaseErr } = await supabase
    .from('purchases')
    .select('border_slug, border_name, created_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  const { data: orderRows, error: orderErr } = await supabase
    .from('orders')
    .select('border_slug, created_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (purchaseErr && !purchaseErr.message?.toLowerCase().includes('does not exist')) {
    console.warn('fetchPurchasedBordersForUser purchases:', purchaseErr.message);
  }
  if (orderErr && !orderErr.message?.toLowerCase().includes('does not exist')) {
    console.warn('fetchPurchasedBordersForUser orders:', orderErr.message);
  }

  const orderMapped: PurchaseRow[] = ((orderRows ?? []) as { border_slug: string; created_at: string }[]).map(
    (r) => ({
      border_slug: r.border_slug,
      border_name: BORDER_TEMPLATES.find((b) => b.slug === r.border_slug)?.name ?? r.border_slug,
      created_at: r.created_at,
    })
  );

  const rows = [...((purchaseRows ?? []) as PurchaseRow[]), ...orderMapped];
  const seen = new Set<string>();
  const out: PurchaseRow[] = [];
  for (const r of rows) {
    if (!r.border_slug || seen.has(r.border_slug)) continue;
    seen.add(r.border_slug);
    out.push(r);
  }
  return out;
}
