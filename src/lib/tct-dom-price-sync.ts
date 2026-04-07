import { convertUsdAmountForDisplay, type DisplayCurrency } from '@/lib/tct-display-currency';
import { formatPriceWithCurrencyCode } from '@/lib/formatPrice';
import { displayAmountForTctKind, TCT_PRICE_REGIONAL, type TctPriceKind } from '@/lib/tct-price-region';

/**
 * Updates declarative price nodes after the user changes display currency.
 * - `[data-tct-price]` — catalog SKUs (fixed USD/NZD/AUD, GBP via USD×rate).
 * - `[data-tct-usd]` — amounts stored as USD (e.g. printing estimates); all codes use FX from USD.
 * - `.woocommerce-Price-amount` — heuristic for WordPress/WooCommerce (leaf text nodes, `$nnn.nn` only).
 */
export function applyTctPriceNodes(
  root: Document | HTMLElement,
  display: DisplayCurrency,
  rates: Record<string, number>,
) {
  root.querySelectorAll<HTMLElement>('[data-tct-price]').forEach((el) => {
    const raw = el.dataset.tctPrice;
    if (!raw || !(raw in TCT_PRICE_REGIONAL)) return;
    const kind = raw as TctPriceKind;
    const amount = displayAmountForTctKind(kind, display, rates);
    el.textContent = formatPriceWithCurrencyCode(amount, display);
  });

  root.querySelectorAll<HTMLElement>('[data-tct-usd]').forEach((el) => {
    const n = Number(el.dataset.tctUsd);
    if (!Number.isFinite(n)) return;
    const conv = convertUsdAmountForDisplay(n, display, rates);
    el.textContent = formatPriceWithCurrencyCode(conv, display);
  });

  root.querySelectorAll<HTMLElement>('.woocommerce-Price-amount, .shopify-Price-amount').forEach((el) => {
    if (el.closest('[data-tct-skip-fx]')) return;
    if (el.dataset.tctPrice != null || el.dataset.tctUsd != null) return;
    if (el.querySelector('*')) return;
    const txt = (el.textContent ?? '').replace(/,/g, '').trim();
    const m = txt.match(/^\$?\s*([0-9]+(?:\.[0-9]+)?)\s*$/);
    if (!m) return;
    const usd = Number(m[1]);
    if (!Number.isFinite(usd)) return;
    const conv = convertUsdAmountForDisplay(usd, display, rates);
    el.textContent = formatPriceWithCurrencyCode(conv, display);
  });
}
