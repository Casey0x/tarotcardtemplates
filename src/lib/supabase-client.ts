import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Do not set global Content-Type — conflicts with Storage uploads (see supabase-js #2207).
      global: {
        headers: {
          Accept: 'application/json',
        },
      },
    }
  );
}
