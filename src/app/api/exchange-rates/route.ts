import { NextResponse } from 'next/server';

const FRANKFURTER_USD_LATEST = 'https://api.frankfurter.app/latest?from=USD';

/**
 * Proxies ECB-based USD rates from Frankfurter (server-side) so the browser avoids CORS.
 * Cached 24h via Next.js Data Cache on this fetch.
 */
export async function GET() {
  try {
    const res = await fetch(FRANKFURTER_USD_LATEST, {
      next: { revalidate: 86400 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Upstream rates unavailable', detail: text.slice(0, 200), status: res.status },
        { status: 502 },
      );
    }

    const data = (await res.json()) as Record<string, unknown>;

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Fetch failed' },
      { status: 500 },
    );
  }
}
