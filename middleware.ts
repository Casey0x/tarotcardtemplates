import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  TCT_COUNTRY_COOKIE,
  resolveCountryForPricingMiddleware,
} from '@/lib/request-country';

const PRICING_COUNTRY_COOKIE_OPTS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 180,
  sameSite: 'lax' as const,
};

function applyPricingCountryCookies(res: NextResponse, resolved: string | null) {
  if (resolved === 'NZ' || resolved === 'AU') {
    res.cookies.set(TCT_COUNTRY_COOKIE, resolved, PRICING_COUNTRY_COOKIE_OPTS);
  } else if (resolved) {
    res.cookies.delete(TCT_COUNTRY_COOKIE);
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  const resolved = resolveCountryForPricingMiddleware(request);
  if (resolved) {
    requestHeaders.set('x-detected-country', resolved);
  }

  const isStudio = path.startsWith('/studio');
  const isAuth = path.startsWith('/auth');

  if (!isStudio || isAuth) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applyPricingCountryCookies(res, resolved);
    return res;
  }

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/account', request.url);
    loginUrl.searchParams.set('redirect', path);
    const redirect = NextResponse.redirect(loginUrl);
    applyPricingCountryCookies(redirect, resolved);
    return redirect;
  }

  applyPricingCountryCookies(response, resolved);
  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all pages so we can forward geo/country for pricing (not only /studio).
     * Excludes static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
