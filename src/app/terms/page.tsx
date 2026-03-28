import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms governing use of Tarot Card Templates, digital products, and optional printing services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-4xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-charcoal/70">Last updated: March 29, 2026</p>
      <div className="space-y-6 text-charcoal/85">
        <p>
          This placeholder Terms of Service page is provided for navigation and SEO structure. Replace it with terms
          reviewed by qualified counsel for your entity, products, refunds, licenses, and dispute resolution.
        </p>
        <p>
          By using Tarot Card Templates, you agree to use the site and any purchased digital products in accordance with
          applicable law and the license terms provided at purchase.
        </p>
        <p>
          Templates and borders are licensed for use as described in your order; redistribution of source files may be
          restricted. Printing and fulfillment partners operate under their own terms where applicable.
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
