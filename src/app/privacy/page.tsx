import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Tarot Card Templates collects, uses, and protects your information when you use our website and services.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-4xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-charcoal/70">Last updated: March 29, 2026</p>
      <div className="space-y-6 text-charcoal/85">
        <p>
          This placeholder Privacy Policy is provided for navigation and SEO structure. Replace this content with a policy
          tailored to your business, jurisdictions, analytics, cookies, and data processors (e.g. hosting, email, payments).
        </p>
        <p>
          We respect your privacy. When you use Tarot Card Templates, we may collect information you provide (such as
          account and order details) and technical data (such as browser type) as needed to operate the site and fulfill
          orders.
        </p>
        <p>
          For questions about privacy, contact us through the channels listed on this site once your production contact
          details are configured.
        </p>
      </div>
      <p>
        <Link href="/" className="text-sm underline underline-offset-4">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
