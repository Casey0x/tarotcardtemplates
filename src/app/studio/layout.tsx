import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | Tarot Card Templates',
  description: 'Design your tarot deck card by card.',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream text-charcoal">{children}</div>;
}
