'use client';

import Link from 'next/link';

/** Legacy route after removed Stripe Studio checkout; keep a friendly landing page. */
export function StudioExportSuccessClient() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-charcoal">Studio</h1>
      <p className="mt-4 text-sm text-charcoal/75">
        Deck downloads are free from the Studio. Open your project and use <span className="font-medium">Download my deck</span>{' '}
        when you have rendered cards.
      </p>
      <Link
        href="/studio-beta"
        className="mt-8 inline-flex rounded-sm border border-charcoal bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal/90"
      >
        Go to Studio
      </Link>
    </div>
  );
}
