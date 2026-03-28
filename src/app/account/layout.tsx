import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My account',
  description: 'Sign in to your Tarot Card Templates account to access Tarot Studio and your purchases.',
  alternates: { canonical: '/account' },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
