/** @type {import('next').NextConfig} */
// Intentionally no `output: 'export'` — app uses SSR/ISR and server features; static export would
// require every dynamic route to be listed in generateStaticParams() and would break API routes.
const nextConfig = {
  images: {
    domains: [
      'iwhejzjkdqkmkzzhibtv.supabase.co',
      'templated-assets.s3.amazonaws.com',
    ],
  },
  // Geo/currency pricing is per-request; avoid CDN/browser serving stale HTML (USD) while other
  // routes show localized prices (e.g. /borders had no-store but /templates did not).
  async headers() {
    const noStore = {
      key: 'Cache-Control',
      value: 'private, no-cache, no-store, must-revalidate',
    };
    return [
      { source: '/', headers: [noStore] },
      { source: '/borders', headers: [noStore] },
      { source: '/borders/:path*', headers: [noStore] },
      { source: '/templates', headers: [noStore] },
      { source: '/templates/:path*', headers: [noStore] },
    ];
  },
};

export default nextConfig;
