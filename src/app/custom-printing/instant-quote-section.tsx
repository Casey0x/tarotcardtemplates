'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

const ACCENT = '#C7A96B';
const HEADING = '#f0ece4';
const CARD_BG = '#272320';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const CARD_BODY = '#b8b0a6';
const BTN_DARK_TEXT = '#1a1814';
const INPUT_BG = '#1a1814';
const INPUT_BORDER = 'rgba(255,255,255,0.15)';
const RESULT_PANEL = '#2e2b27';
const RESULT_BORDER = 'rgba(255,255,255,0.1)';
const FEATURED_GOLD = '#D4AF37';

const CARDS_PER_DECK = 78;
const LINEN_PER_DECK = 0.5 * CARDS_PER_DECK;
const STOCK_350_EXTRA = 0.4;
const SHRINK_WRAP_EXTRA = 0.15;

const PROTOTYPE_FLAT = 49;

function baseRatePerDeck(qty: number): number {
  if (qty <= 0) return 0;
  if (qty === 1) return PROTOTYPE_FLAT;
  if (qty >= 2 && qty <= 24) return 12;
  if (qty >= 25 && qty <= 200) return 6.5;
  if (qty >= 201 && qty <= 499) return 5;
  return 3.2;
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function turnaroundLabel(qty: number): string {
  if (qty === 1) return '5–7 business days';
  if (qty >= 2 && qty <= 200) return '10–14 business days';
  if (qty >= 201 && qty <= 499) return '2–3 weeks';
  return '3–4 weeks';
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1814] focus-visible:ring-[#C7A96B]';

export function InstantQuoteSection() {
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<'300' | '350'>('300');
  const [finish, setFinish] = useState<'gloss' | 'linen'>('gloss');
  const [shrinkWrap, setShrinkWrap] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formFinish, setFormFinish] = useState<'gloss' | 'linen' | 'unsure'>('gloss');
  const [formShrink, setFormShrink] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const clampQty = useCallback((n: number) => Math.min(1000, Math.max(1, Math.floor(n) || 1)), []);

  const estimate = useMemo(() => {
    const qty = clampQty(quantity);
    const isPrototype = qty === 1;

    if (isPrototype) {
      return {
        qty,
        isPrototype: true,
        perDeck: PROTOTYPE_FLAT,
        total: PROTOTYPE_FLAT,
        basePerDeck: PROTOTYPE_FLAT,
        stockExtra: 0,
        linenExtra: 0,
        shrinkExtra: 0,
      };
    }

    const base = baseRatePerDeck(qty);
    const stockExtra = stock === '350' ? STOCK_350_EXTRA : 0;
    const linenExtra = finish === 'linen' ? LINEN_PER_DECK : 0;
    const shrinkExtra = shrinkWrap ? SHRINK_WRAP_EXTRA : 0;
    const perDeck = base + stockExtra + linenExtra + shrinkExtra;
    const total = perDeck * qty;

    return {
      qty,
      isPrototype: false,
      perDeck,
      total,
      basePerDeck: base,
      stockExtra: stock === '350' ? STOCK_350_EXTRA : 0,
      linenExtra: finish === 'linen' ? LINEN_PER_DECK : 0,
      shrinkExtra: shrinkWrap ? SHRINK_WRAP_EXTRA : 0,
    };
  }, [quantity, stock, finish, shrinkWrap, clampQty]);

  const scrollToQuote = useCallback(() => {
    setFormQuantity(clampQty(quantity));
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [quantity, clampQty]);

  const onRangeChange = (v: number) => {
    setQuantity(clampQty(v));
  };

  const onNumberChange = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) {
      setQuantity(1);
      return;
    }
    setQuantity(clampQty(n));
  };

  const onSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const res = await fetch('/api/print-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          quantity: formQuantity,
          finishPreference: formFinish,
          shrinkWrap: formShrink,
          specialRequirements: formNotes,
        }),
      });
      if (res.ok) setFormStatus('success');
      else setFormStatus('error');
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <>
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center md:mb-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]" style={{ color: HEADING }}>
              Get an Instant Estimate
            </h2>
            <p className="text-base leading-relaxed md:text-lg" style={{ color: CARD_BODY }}>
              Adjust the options below to see an estimated price for your print run. All prices in USD.
            </p>
          </div>

          <div
            className="rounded-xl border p-6 shadow-[0_12px_48px_rgba(0,0,0,0.35)] md:p-10"
            style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              {/* Inputs */}
              <div className="space-y-8">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium" style={{ color: HEADING }}>
                    Quantity
                  </label>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <input
                      type="range"
                      min={1}
                      max={1000}
                      step={1}
                      value={quantity}
                      onChange={(e) => onRangeChange(Number(e.target.value))}
                      className={`h-2 flex-1 min-w-[8rem] cursor-pointer accent-[#C7A96B] ${focusRing} rounded-full`}
                      aria-valuemin={1}
                      aria-valuemax={1000}
                      aria-valuenow={quantity}
                    />
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={quantity}
                      onChange={(e) => onNumberChange(e.target.value)}
                      className={`w-24 rounded-md border px-3 py-2 text-sm tabular-nums ${focusRing}`}
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: HEADING,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: CARD_BODY }}>
                    1 deck = prototype pricing · 25–200 decks = small batch · 500+ = production rates
                  </p>
                </div>

                {/* Card stock */}
                <div>
                  <span className="block text-sm font-medium" style={{ color: HEADING }}>
                    Card stock
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="stock"
                        className="sr-only"
                        checked={stock === '300'}
                        onChange={() => setStock('300')}
                      />
                      <span
                        className={`inline-block rounded-full border px-4 py-2 text-sm transition-colors ${stock === '300' ? 'border-[#C7A96B] bg-[#C7A96B]/15' : 'border-white/15 bg-black/20'}`}
                        style={{ color: HEADING }}
                      >
                        300gsm Smooth
                      </span>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="stock"
                        className="sr-only"
                        checked={stock === '350'}
                        onChange={() => setStock('350')}
                      />
                      <span
                        className={`inline-block rounded-full border px-4 py-2 text-sm transition-colors ${stock === '350' ? 'border-[#C7A96B] bg-[#C7A96B]/15' : 'border-white/15 bg-black/20'}`}
                        style={{ color: HEADING }}
                      >
                        350gsm Black Core (+$0.40/deck)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Finish */}
                <div>
                  <span className="block text-sm font-medium" style={{ color: HEADING }}>
                    Finish
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="finish"
                        className="sr-only"
                        checked={finish === 'gloss'}
                        onChange={() => setFinish('gloss')}
                      />
                      <span
                        className={`inline-block rounded-full border px-4 py-2 text-sm transition-colors ${finish === 'gloss' ? 'border-[#C7A96B] bg-[#C7A96B]/15' : 'border-white/15 bg-black/20'}`}
                        style={{ color: HEADING }}
                      >
                        Gloss (included)
                      </span>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="finish"
                        className="sr-only"
                        checked={finish === 'linen'}
                        onChange={() => setFinish('linen')}
                      />
                      <span
                        className={`inline-block rounded-full border px-4 py-2 text-sm transition-colors ${finish === 'linen' ? 'border-[#C7A96B] bg-[#C7A96B]/15' : 'border-white/15 bg-black/20'}`}
                        style={{ color: HEADING }}
                      >
                        Linen (+$0.50/card × 78)
                      </span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: CARD_BODY }}>
                    Linen adds {formatUsd(0.5)} per card × {CARDS_PER_DECK} cards = {formatUsd(LINEN_PER_DECK)} per deck.
                  </p>
                </div>

                {/* Shrink wrap */}
                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
                    <input
                      type="checkbox"
                      checked={shrinkWrap}
                      onChange={(e) => setShrinkWrap(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 accent-[#C7A96B]"
                    />
                    <span>
                      <span className="block text-sm font-medium" style={{ color: HEADING }}>
                        Shrink wrap (+$0.15/deck)
                      </span>
                      <span className="mt-1 block text-xs" style={{ color: CARD_BODY }}>
                        Optional protective wrap for retail-ready decks.
                      </span>
                    </span>
                  </label>
                </div>

                <p className="text-sm" style={{ color: CARD_BODY }}>
                  <span style={{ color: ACCENT }}>✓</span> Tuck box included with all orders.
                </p>
              </div>

              {/* Result */}
              <div
                className="flex flex-col rounded-lg border p-6 md:p-8"
                style={{ backgroundColor: RESULT_PANEL, borderColor: RESULT_BORDER }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                  Your estimate
                </p>
                <p className="font-serif mt-4 text-4xl font-semibold tabular-nums md:text-5xl" style={{ color: HEADING }}>
                  {formatUsd(estimate.total)}
                </p>
                <p className="mt-2 text-sm" style={{ color: CARD_BODY }}>
                  {estimate.isPrototype
                    ? `${formatUsd(PROTOTYPE_FLAT)} flat · 1 deck`
                    : `${formatUsd(estimate.perDeck)} per deck · ${estimate.qty} decks`}
                </p>

                <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm" style={{ color: CARD_BODY }}>
                  {estimate.isPrototype ? (
                    <>
                      <p>Prototype rate: {formatUsd(PROTOTYPE_FLAT)} (fixed)</p>
                      <p className="text-xs italic" style={{ color: CARD_BODY }}>
                        Prototype price is fixed and includes tuck box and gloss finish.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Base rate: {formatUsd(estimate.basePerDeck)}/deck</p>
                      {stock === '350' && (
                        <p>350gsm Black Core: +{formatUsd(STOCK_350_EXTRA)}/deck</p>
                      )}
                      {finish === 'linen' && (
                        <p>
                          Linen finish: +{formatUsd(0.5)} × {CARDS_PER_DECK} cards = +{formatUsd(LINEN_PER_DECK)}/deck
                        </p>
                      )}
                      {shrinkWrap && <p>Shrink wrap: +{formatUsd(SHRINK_WRAP_EXTRA)}/deck</p>}
                      <p>Tuck box: Included</p>
                      <p className="pt-2 font-medium" style={{ color: HEADING }}>
                        Total per deck: {formatUsd(estimate.perDeck)}
                      </p>
                    </>
                  )}
                </div>

                <p className="mt-6 text-sm" style={{ color: HEADING }}>
                  Estimated turnaround: <span style={{ color: CARD_BODY }}>{turnaroundLabel(estimate.qty)}</span>
                </p>

                <p className="mt-4 text-xs leading-relaxed" style={{ color: CARD_BODY, opacity: 0.9 }}>
                  Prices are estimates in USD. Final quote confirmed on file review. International orders may be subject
                  to import duties and taxes.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {estimate.qty === 1 ? (
                    <Link
                      href="#"
                      className="block w-full rounded-sm py-3.5 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: FEATURED_GOLD, color: BTN_DARK_TEXT }}
                    >
                      Order Now
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={scrollToQuote}
                      className="w-full rounded-sm py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: FEATURED_GOLD, color: BTN_DARK_TEXT }}
                    >
                      Order Now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={scrollToQuote}
                    className="w-full rounded-sm border py-3.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ borderColor: HEADING, color: HEADING }}
                  >
                    Get an Exact Quote ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quote-form" className="scroll-mt-24 px-6 py-20 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-[2rem]" style={{ color: HEADING }}>
            Request an Exact Quote
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: CARD_BODY }}>
            For custom requirements, large runs, or anything not covered above — send us the details and we&apos;ll reply
            within one business day.
          </p>

          {formStatus === 'success' ? (
            <p className="mt-8 rounded-lg border border-[#C7A96B]/40 bg-[#C7A96B]/10 px-4 py-3 text-sm" style={{ color: HEADING }}>
              Thanks! We&apos;ll be in touch within one business day.
            </p>
          ) : (
            <form onSubmit={onSubmitQuote} className="mt-10 space-y-6">
              <div>
                <label htmlFor="quote-name" className="block text-sm font-medium" style={{ color: HEADING }}>
                  Name
                </label>
                <input
                  id="quote-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`mt-2 w-full rounded-md border px-4 py-3 text-sm ${focusRing}`}
                  style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: HEADING }}
                />
              </div>
              <div>
                <label htmlFor="quote-email" className="block text-sm font-medium" style={{ color: HEADING }}>
                  Email
                </label>
                <input
                  id="quote-email"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={`mt-2 w-full rounded-md border px-4 py-3 text-sm ${focusRing}`}
                  style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: HEADING }}
                />
              </div>
              <div>
                <label htmlFor="quote-qty" className="block text-sm font-medium" style={{ color: HEADING }}>
                  Quantity
                </label>
                <input
                  id="quote-qty"
                  type="number"
                  min={1}
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(clampQty(Number(e.target.value)))}
                  className={`mt-2 w-full rounded-md border px-4 py-3 text-sm ${focusRing}`}
                  style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: HEADING }}
                />
              </div>
              <div>
                <label htmlFor="quote-finish" className="block text-sm font-medium" style={{ color: HEADING }}>
                  Finish preference
                </label>
                <select
                  id="quote-finish"
                  value={formFinish}
                  onChange={(e) => setFormFinish(e.target.value as 'gloss' | 'linen' | 'unsure')}
                  className={`mt-2 w-full rounded-md border px-4 py-3 text-sm ${focusRing}`}
                  style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: HEADING }}
                >
                  <option value="gloss">Gloss</option>
                  <option value="linen">Linen</option>
                  <option value="unsure">Not sure</option>
                </select>
              </div>
              <fieldset>
                <legend className="text-sm font-medium" style={{ color: HEADING }}>
                  Shrink wrap
                </legend>
                <div className="mt-3 flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: CARD_BODY }}>
                    <input
                      type="radio"
                      name="form-shrink"
                      checked={formShrink === true}
                      onChange={() => setFormShrink(true)}
                      className="accent-[#C7A96B]"
                    />
                    Yes please
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: CARD_BODY }}>
                    <input
                      type="radio"
                      name="form-shrink"
                      checked={formShrink === false}
                      onChange={() => setFormShrink(false)}
                      className="accent-[#C7A96B]"
                    />
                    No thanks
                  </label>
                </div>
              </fieldset>
              <div>
                <label htmlFor="quote-notes" className="block text-sm font-medium" style={{ color: HEADING }}>
                  Special requirements
                </label>
                <textarea
                  id="quote-notes"
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. rush order, international shipping, large volume pricing…"
                  className={`mt-2 w-full rounded-md border px-4 py-3 text-sm placeholder:text-white/35 ${focusRing}`}
                  style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: HEADING }}
                />
              </div>
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full rounded-sm py-3.5 text-sm font-semibold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: FEATURED_GOLD, color: BTN_DARK_TEXT }}
              >
                {formStatus === 'submitting' ? 'Sending…' : 'Send Quote Request'}
              </button>
              {formStatus === 'error' && (
                <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
