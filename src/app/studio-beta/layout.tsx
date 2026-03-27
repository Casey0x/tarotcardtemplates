import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio (Beta) | Tarot Card Templates',
  description: 'Design your tarot deck card by card.',
};

export default function StudioBetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream text-charcoal">{children}</div>;
}
