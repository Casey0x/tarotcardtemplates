import type { Metadata } from 'next';
import { DEFAULT_BORDER_PRICE_CENTS } from '@/data/borders';
import { TEMPLATE_PRICE } from '@/data/templates';
import { formatUsdAsLocalCurrency } from '@/lib/formatPrice';
import { getUserCurrency } from '@/lib/getUserCurrency';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Design your own deck with borders and the Studio, or buy a ready-made tarot template — purchase, download, and print.',
  alternates: { canonical: '/how-it-works' },
};

export default async function HowItWorksPage() {
  const { currency } = getUserCurrency();
  const borderPriceDisplay = formatUsdAsLocalCurrency(DEFAULT_BORDER_PRICE_CENTS / 100, currency);
  const templateDownloadPriceDisplay = formatUsdAsLocalCurrency(TEMPLATE_PRICE, currency);

  return (
    <div className="max-w-3xl space-y-14">
      <header>
        <h1 className="text-4xl font-semibold">How it works</h1>
        <p className="mt-3 text-charcoal/75">
          Two ways to get a beautiful tarot deck: design your own with our borders, or download a complete ready-made
          deck.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-charcoal">Design your own deck (border + Studio)</h2>
        <ol className="space-y-6">
          <li>
            <h3 className="text-xl font-medium">1. Browse borders</h3>
            <p className="mt-2 text-charcoal/80">
              Pick a border style that matches your deck&apos;s aesthetic — from minimal lines to ornate gilded frames.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium">2. Try it in the Studio</h3>
            <p className="mt-2 text-charcoal/80">
              Upload your artwork and preview how it looks inside the border. Free to try before you buy.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium">3. Purchase your border ({borderPriceDisplay})</h3>
            <p className="mt-2 text-charcoal/80">
              Unlock saving, exporting, and print-ready file generation through the full Studio deck flow after checkout.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium">4. Design all 78 cards</h3>
            <p className="mt-2 text-charcoal/80">
              Work through your deck card by card in the Studio. Your progress is saved on purchased borders.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-medium">5. Export &amp; print</h3>
            <p className="mt-2 text-charcoal/80">
              Download print-ready files or order professional printing through our print service.
            </p>
          </li>
        </ol>
      </section>

      <div className="border-t border-charcoal/15 pt-12">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-charcoal">Ready-made decks</h2>
          <p className="text-charcoal/80">
            Complete 78-card decks with original artwork — instant digital download (prices vary by deck).
          </p>
          <ol className="space-y-6">
            <li>
              <h3 className="text-xl font-medium">1. Choose a template</h3>
              <p className="mt-2 text-charcoal/80">
                Browse the gallery and pick the deck that matches your direction.
              </p>
            </li>
            <li>
              <h3 className="text-xl font-medium">2. Purchase</h3>
              <p className="mt-2 text-charcoal/80">
                Buy a digital template ({templateDownloadPriceDisplay}), or add the optional single printed deck at
                checkout
                where available.
              </p>
            </li>
            <li>
              <h3 className="text-xl font-medium">3. Receive files or print order confirmation</h3>
              <p className="mt-2 text-charcoal/80">
                Digital orders continue to a download page. Printed deck orders are recorded with status{' '}
                <strong>ordered</strong>.
              </p>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
