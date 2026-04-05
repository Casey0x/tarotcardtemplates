import type { SendQuoteRequestEmailsParams } from '@/lib/email-quote';

const basicEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function quantityToString(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return String(Math.trunc(v));
  }
  if (typeof v === 'string' && v.trim().length > 0) {
    return v.trim();
  }
  return null;
}

/** Maps API variants (finishPreference, boolean shrinkWrap) to sendQuoteRequestEmails shape. */
export function resolveFinish(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const lower = raw.trim().toLowerCase();
  if (lower === 'gloss') return 'Gloss';
  if (lower === 'linen') return 'Linen';
  if (lower === 'unsure' || lower === 'not sure') return 'Not sure';
  return raw.trim();
}

export function resolveShrinkWrap(raw: unknown): string | null {
  if (typeof raw === 'boolean') {
    return raw ? 'Yes please' : 'No thanks';
  }
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim();
    const lower = s.toLowerCase();
    if (lower === 'yes' || lower === 'yes please' || s === 'Yes please') return 'Yes please';
    if (lower === 'no' || lower === 'no thanks' || s === 'No thanks') return 'No thanks';
    return s;
  }
  return null;
}

export type ParseQuoteResult =
  | { ok: true; params: SendQuoteRequestEmailsParams }
  | { ok: false; error: string; status: number };

/**
 * Shared parser for POST /api/send-quote-request and POST /api/print-quote.
 * Accepts `finish` or legacy `finishPreference`; `shrinkWrap` as boolean or string.
 */
export function parseQuoteRequestBody(body: unknown): ParseQuoteResult {
  if (body == null || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON body', status: 400 };
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const quantity = quantityToString(b.quantity);

  const finishRaw = b.finish ?? b.finishPreference;
  const finish = typeof finishRaw === 'string' ? resolveFinish(finishRaw) : null;

  const shrinkWrap = resolveShrinkWrap(b.shrinkWrap);

  const specialRequirements =
    typeof b.specialRequirements === 'string' && b.specialRequirements.trim().length > 0
      ? b.specialRequirements.trim()
      : undefined;

  if (!name || !email || !quantity || !finish || !shrinkWrap) {
    return {
      ok: false,
      error:
        'Missing required fields: name, email, quantity, finish (or finishPreference), shrinkWrap',
      status: 400,
    };
  }

  if (!basicEmailRe.test(email)) {
    return { ok: false, error: 'Invalid email address', status: 400 };
  }

  return {
    ok: true,
    params: {
      name,
      email,
      quantity,
      finish,
      shrinkWrap,
      specialRequirements,
    },
  };
}
