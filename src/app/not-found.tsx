import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-charcoal/60">404</p>
      <h1 className="text-3xl font-semibold text-charcoal">Page not found</h1>
      <p className="text-charcoal/80">
        That page does not exist or may have moved. Use the navigation above or choose a destination below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link href="/" className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream">
          Back to home
        </Link>
        <Link
          href="/templates"
          className="rounded-sm border border-charcoal/80 bg-cream px-6 py-3 text-sm font-medium text-charcoal"
        >
          Browse templates
        </Link>
      </div>
    </div>
  );
}
