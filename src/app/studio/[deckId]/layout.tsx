import type { Metadata } from 'next';

/**
 * Deck-scoped Studio routes load user-specific Supabase data (RLS-protected workspaces).
 * They should not be indexed; avoid canonical URLs to arbitrary deck UUIDs.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function StudioDeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
