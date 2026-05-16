import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

export const metadata: Metadata = {
  alternates: { canonical: '/studio-beta' },
};

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function StudioPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }
  const qs = params.toString();
  permanentRedirect(qs ? `/studio-beta?${qs}` : '/studio-beta');
}
