'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCheckingSession(false);
      if (user) {
        router.replace('/studio');
      }
    });
  }, [router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push('/studio');
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage('Check your email for the confirmation link.');
    router.refresh();
  }

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-sm p-8 text-center text-charcoal/80">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-sm border border-charcoal/10 bg-cardBg p-8">
      <h1 className="text-2xl font-semibold text-charcoal">My account</h1>
      <p className="text-sm text-charcoal/70">
        Sign in or create an account to access the Studio.
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
            disabled={loading}
            className="w-full rounded-[2px] border border-charcoal bg-charcoal px-4 py-2 text-cream hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded-[2px] border border-charcoal/80 bg-cream px-4 py-2 text-charcoal/80 hover:bg-charcoal/5 disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-charcoal/70">
        <Link href="/studio" className="underline underline-offset-2 hover:text-charcoal">
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
