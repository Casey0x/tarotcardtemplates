'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-lg border border-charcoal/10 bg-cream/50 p-8">
      <h1 className="text-2xl font-semibold text-charcoal">Create account</h1>
      <p className="text-sm text-charcoal/80">
        Create an account to use the Studio and save your decks.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-charcoal">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-charcoal/20 bg-white px-3 py-2 text-charcoal"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-charcoal">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded border border-charcoal/20 bg-white px-3 py-2 text-charcoal"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/90 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="text-center text-sm text-charcoal/80">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
