import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
  description:
    'Your Tarot Card Templates dashboard: purchased borders, deck projects, and ready-made template downloads.',
  alternates: { canonical: '/account' },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
