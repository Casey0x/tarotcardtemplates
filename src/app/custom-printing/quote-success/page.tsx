import Link from 'next/link';
import type { Metadata } from 'next';
import { CustomPrintingGtagSuccessEvent } from '../custom-printing-gtag-success-event';

const PAGE_BG = '#1a1814';
const ACCENT = '#C7A96B';
const HEADING = '#f0ece4';
const BODY = '#d4cfc7';

export const metadata: Metadata = {
  title: 'Quote received | Custom printing | TarotCardTemplates.com',
  robots: { index: false, follow: false },
};

export default function CustomPrintingQuoteSuccessPage() {
  return (
    <div
      className="-mx-6 -my-12 min-h-[60vh] px-6 py-20 font-sans md:px-8"
      style={{ backgroundColor: PAGE_BG, color: BODY }}
    >
      <CustomPrintingGtagSuccessEvent eventName="quote_request" />
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: ACCENT }}>
          Quote request
        </p>
        <h1
          className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
          style={{ color: HEADING }}
        >
          Thank you!
        </h1>
        <p className="mt-6 text-lg leading-relaxed">
          Your quote request has been received. Someone will be in touch within 24 hours.
        </p>
        <Link
          href="/custom-printing"
          className="mt-10 inline-block rounded-sm px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: PAGE_BG }}
        >
          Back to custom printing
        </Link>
      </div>
    </div>
  );
}
