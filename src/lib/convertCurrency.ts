/** Static FX: USD → target (display only; base DB values remain USD). */
const USD_TO_NZD = 1.65;
const USD_TO_AUD = 1.5;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Convert a USD amount to the target currency using static rates.
 * USD → NZD × 1.65, USD → AUD × 1.50, USD → USD × 1.
 */
export function convertPrice(amountUSD: number, currency: string): number {
  const c = currency.toUpperCase();
  if (c === 'USD' || c === '') return round2(amountUSD);
  if (c === 'NZD') return round2(amountUSD * USD_TO_NZD);
  if (c === 'AUD') return round2(amountUSD * USD_TO_AUD);
  return round2(amountUSD);
}
