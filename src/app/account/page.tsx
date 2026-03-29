'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { FALLBACK_BORDER_IMAGE } from '@/lib/media-fallbacks';

type DeckRow = {
  id: string;
  border_name: string;
  total_cards: number;
  completed_cards: number;
  status: string;
  created_at: string;
};

type PurchaseRow = {
  border_slug: string;
  border_name: string;
  created_at: string;
};

function borderImageForSlug(slug: string): string {
  const t = BORDER_TEMPLATES.find((b) => b.slug === slug);
  return t?.image?.trim() ? t.image : FALLBACK_BORDER_IMAGE;
}

export default function AccountPage() {
  const router = useRouter();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [decks, setDecks] = useState<DeckRow[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setSessionLoading(false);
      if (!u) {
        setUser(null);
        return;
      }
      setUser({ email: u.email ?? undefined, created_at: u.created_at });
      setDataLoading(true);
      const { data: pur } = await supabase
        .from('purchases')
        .select('border_slug, border_name, created_at')
        .eq('user_id', u.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      const raw = (pur ?? []) as PurchaseRow[];
      const seen = new Set<string>();
      const deduped: PurchaseRow[] = [];
      for (const r of raw) {
        if (!r.border_slug || seen.has(r.border_slug)) continue;
        seen.add(r.border_slug);
        deduped.push(r);
      }
      setPurchases(deduped);

      const { data: deckData } = await supabase
        .from('decks')
        .select('id, border_name, total_cards, completed_cards, status, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      setDecks((deckData as DeckRow[]) ?? []);
      setDataLoading(false);
    });
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const u = data.user;
    if (u) {
      setUser({ email: u.email ?? undefined, created_at: u.created_at });
      setDataLoading(true);
      const { data: pur } = await supabase
        .from('purchases')
        .select('border_slug, border_name, created_at')
        .eq('user_id', u.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      const raw = (pur ?? []) as PurchaseRow[];
      const seen = new Set<string>();
      const deduped: PurchaseRow[] = [];
      for (const r of raw) {
        if (!r.border_slug || seen.has(r.border_slug)) continue;
        seen.add(r.border_slug);
        deduped.push(r);
      }
      setPurchases(deduped);
      const { data: deckData } = await supabase
        .from('decks')
        .select('id, border_name, total_cards, completed_cards, status, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      setDecks((deckData as DeckRow[]) ?? []);
      setDataLoading(false);
    }
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({ email, password });
    setAuthLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage('Check your email for the confirmation link.');
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setPurchases([]);
    setDecks([]);
    router.refresh();
  }

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-charcoal/80">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm space-y-6 rounded-sm border border-charcoal/10 bg-cardBg p-8">
        <h1 className="text-2xl font-semibold text-charcoal">My account</h1>
        <p className="text-sm text-charcoal/70">
          Sign in or create an account to access your dashboard and the Studio.
        </p>
        <form className="space-y-4">
          <div>
            <label htmlFor="account-email" className="mb-1 block text-sm font-medium text-charcoal">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-[2px] border border-charcoal/20 bg-white px-3 py-2 text-charcoal"
            />
          </div>
          <div>
            <label htmlFor="account-password" className="mb-1 block text-sm font-medium text-charcoal">
              Password
            </label>
            <input
              id="account-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-[2px] border border-charcoal/20 bg-white px-3 py-2 text-charcoal"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-700" role="status">
              {message}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authLoading}
              className="w-full rounded-[2px] border border-charcoal bg-charcoal px-4 py-2 text-cream hover:bg-charcoal/90 disabled:opacity-50"
            >
              {authLoading ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={authLoading}
              className="w-full rounded-[2px] border border-charcoal/80 bg-cream px-4 py-2 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-50"
            >
              Sign up
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-charcoal/70">
          <Link href="/studio-beta" className="underline underline-offset-2 hover:text-charcoal">
            Studio
          </Link>
          {' · '}
          <Link href="/borders" className="underline underline-offset-2 hover:text-charcoal">
            Borders
          </Link>
        </p>
      </div>
    );
  }

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal">Account</h1>
          <p className="mt-2 text-sm text-charcoal/80">{user.email}</p>
          {memberSince && <p className="mt-1 text-xs text-charcoal/60">Member since {memberSince}</p>}
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="rounded-sm border border-charcoal/30 px-4 py-2 text-sm text-charcoal/80 hover:bg-charcoal/5"
        >
          Sign out
        </button>
      </div>

      {dataLoading ? (
        <p className="text-sm text-charcoal/70">Loading your purchases…</p>
      ) : null}

      <section>
        <h2 className="text-xl font-semibold text-charcoal">My borders</h2>
        {purchases.length === 0 ? (
          <p className="mt-3 text-sm text-charcoal/75">
            You haven&apos;t purchased any borders yet.{' '}
            <Link href="/borders" className="font-medium text-charcoal underline underline-offset-2">
              Browse borders →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {purchases.map((p) => (
              <li
                key={p.border_slug}
                className="flex flex-wrap items-center gap-4 rounded-sm border border-charcoal/10 bg-cardBg p-4"
              >
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xs border border-charcoal/10 bg-cream">
                  <Image
                    src={borderImageForSlug(p.border_slug)}
                    alt={p.border_name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal">{p.border_name}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/studio-beta?border=${p.border_slug}`}
                      className="text-charcoal underline underline-offset-2 hover:no-underline"
                    >
                      Open in Studio →
                    </Link>
                    <Link
                      href={`/borders/${p.border_slug}`}
                      className="text-charcoal/70 underline underline-offset-2 hover:text-charcoal"
                    >
                      View border &amp; files
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">My deck projects</h2>
        {decks.length === 0 ? (
          <p className="mt-3 text-sm text-charcoal/75">
            Start your first deck in the{' '}
            <Link href="/studio-beta" className="font-medium text-charcoal underline underline-offset-2">
              Studio →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {decks.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/studio/${d.id}`}
                  className="flex flex-col gap-1 rounded-sm border border-charcoal/10 bg-cardBg p-4 transition hover:border-charcoal/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-charcoal">{d.border_name}</span>
                  <span className="text-sm text-charcoal/70">
                    {d.completed_cards}/{d.total_cards} cards
                  </span>
                  <span className="text-sm text-charcoal underline underline-offset-2">Continue designing →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">My templates</h2>
        <p className="mt-3 text-sm text-charcoal/75">
          Pre-made deck purchases are fulfilled via download links from checkout.{' '}
          <Link href="/templates#premade" className="font-medium text-charcoal underline underline-offset-2">
            Browse ready-made tarot decks →
          </Link>
        </p>
      </section>
    </div>
  );
}
