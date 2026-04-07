import { Suspense } from 'react';
import { StudioExportSuccessClient } from './export-success-client';

export const dynamic = 'force-dynamic';

export default function StudioExportSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-6 py-16">
          <h1 className="text-2xl font-semibold text-charcoal">Studio export</h1>
          <p className="mt-4 text-sm text-charcoal/75">Loading…</p>
        </div>
      }
    >
      <StudioExportSuccessClient />
    </Suspense>
  );
}
