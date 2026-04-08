import Link from 'next/link';
import type { Metadata } from 'next';
import { verifyTemplateCheckoutSession } from '@/lib/verify-template-checkout-session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order confirmed — Tarot Card Templates',
  description: 'Thank you for your template purchase.',
  robots: { index: false, follow: false },
};

const SUPPORT_EMAIL = 'casey@tarotcardtemplates.com';

function templateOrderMailto(productName: string, orderReference: string): string {
  const subject = `Template Order #${orderReference}`;
  const body = `Hi, I just purchased ${productName}. My order reference is #${orderReference}. Please send my template files. Thank you!`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = (searchParams.session_id ?? '').trim();

  if (!sessionId) {
    return (
      <div className="mx-auto w-full max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Order lookup</h1>
        <p className="mt-4 text-charcoal/75">
          This page needs a valid checkout link from after your payment. If you completed a purchase, check your email
          for confirmation, or contact{' '}
          <a className="font-medium text-charcoal underline underline-offset-4" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <Link
          href="/templates"
          className="mt-8 inline-block border border-charcoal bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-charcoal/90"
        >
          Return to shop
        </Link>
      </div>
    );
  }

  const result = await verifyTemplateCheckoutSession(sessionId);

  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">We couldn&apos;t verify this order</h1>
        <p className="mt-4 text-charcoal/75">{result.error}</p>
        <Link
          href="/templates"
          className="mt-8 inline-block border border-charcoal bg-charcoal px-5 py-2.5 text-sm text-cream transition-colors hover:bg-charcoal/90"
        >
          Return to shop
        </Link>
      </div>
    );
  }

  const { orderReference, productName } = result;
  const mailto = templateOrderMailto(productName, orderReference);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-14">
      <div className="border border-charcoal/10 bg-white px-8 py-10 shadow-sm">
        <p className="text-center text-5xl leading-none text-green-600" aria-hidden>
          ✅
        </p>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-charcoal">
          Thank you for your purchase!
        </h1>

        <p className="mt-6 text-center text-charcoal/85">
          Your order reference is:{' '}
          <span className="whitespace-nowrap font-semibold text-charcoal">#{orderReference}</span>
        </p>

        <p className="mt-6 text-center text-sm leading-relaxed text-charcoal/80">
          To receive your template files, please email:
          <br />
          <a
            className="mt-1 inline-block font-medium text-charcoal underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

        <p className="mt-5 text-center text-sm leading-relaxed text-charcoal/75">
          Please include your order reference in the subject line and we&apos;ll send your files within 24 hours.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href={mailto}
            className="inline-flex items-center justify-center border border-charcoal bg-charcoal px-6 py-3 text-center text-sm font-medium text-cream transition-colors hover:bg-charcoal/90"
          >
            Email us to receive your files →
          </a>
        </div>

        <p className="mt-10 text-center text-xs text-charcoal/55">
          A confirmation email has been sent if we have your address on file.
        </p>
      </div>

      <p className="mt-10 text-center">
        <Link href="/templates" className="text-sm font-medium text-charcoal underline underline-offset-4">
          Return to shop
        </Link>
      </p>
    </div>
  );
}
