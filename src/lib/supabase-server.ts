import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Session-aware server client (reads cookies). Use in API routes and Server Components. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component — ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}

/** Alias for createClient(); use in API routes to get session from cookies. */
export { createClient as createServerClient };

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Server-only client with service role for studio/admin (bypass RLS). */
export function createServiceClient(): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      // Do not set global Content-Type — it breaks Storage uploads (merged with file type → "Invalid Content-Type header").
      global: {
        headers: {
          Accept: 'application/json',
        },
      },
    }
  );
}
