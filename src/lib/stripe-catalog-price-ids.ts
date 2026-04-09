import type Stripe from 'stripe';
import type { SupportedCurrency } from '@/lib/getUserCurrency';

/**
 * Live Stripe Price IDs (Dashboard → Products → Price ID) for catalog template purchases.
 * Configure in Netlify (or `.env.local`): do not commit secrets.
 *
 * These prices are NZD (e.g. NZ$24.95 template download, NZ$39.95 printed deck).
 * When set and the shopper checks out in NZD, Checkout uses the fixed Price object.
 * Otherwise checkout falls back to dynamic `price_data` for regional USD/AUD/NZD display.
 */
export function getStripePriceIdTemplateDownload(): string | undefined {
  const v = process.env.STRIPE_PRICE_ID_TEMPLATE_DOWNLOAD?.trim();
  return v || undefined;
}

export function getStripePriceIdPrintedDeck(): string | undefined {
  const v = process.env.STRIPE_PRICE_ID_PRINTED_DECK?.trim();
  return v || undefined;
}

/** Stripe Price IDs provided are NZD; use them when checkout currency matches. */
export function shouldUseCatalogStripePriceIds(currency: SupportedCurrency): boolean {
  return currency === 'NZD';
}

/**
 * Catalog `/templates/[slug]` checkout: digital template download vs printed deck shipped.
 * Printed deck Price ID is also used for Studio border print (same NZD product).
 */
export function buildCatalogCheckoutLineItem(
  purchaseType: 'template' | 'print',
  currency: SupportedCurrency,
  lineItemName: string,
  unitAmount: number,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const stripeCurrency = currency.toLowerCase();
  if (shouldUseCatalogStripePriceIds(currency)) {
    if (purchaseType === 'template') {
      const id = getStripePriceIdTemplateDownload();
      if (id) return { price: id, quantity: 1 };
    } else {
      const id = getStripePriceIdPrintedDeck();
      if (id) return { price: id, quantity: 1 };
    }
  }
  return {
    price_data: {
      currency: stripeCurrency,
      product_data: { name: lineItemName },
      unit_amount: Math.round(unitAmount * 100),
    },
    quantity: 1,
  };
}

/** Studio: printed deck — same Stripe Price as catalog printed deck when NZD + env set. */
export function buildStudioPrintedDeckLineItem(
  currency: SupportedCurrency,
  lineItemName: string,
  unitAmount: number,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const stripeCurrency = currency.toLowerCase();
  if (shouldUseCatalogStripePriceIds(currency)) {
    const id = getStripePriceIdPrintedDeck();
    if (id) return { price: id, quantity: 1 };
  }
  return {
    price_data: {
      currency: stripeCurrency,
      product_data: { name: lineItemName },
      unit_amount: Math.round(unitAmount * 100),
    },
    quantity: 1,
  };
}
