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
};

export default nextConfig;
