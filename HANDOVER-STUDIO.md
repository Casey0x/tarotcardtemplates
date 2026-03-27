# Handover prompt for next AI assistant

Copy the block below and paste it when starting a new chat with another AI assistant so they can get up to speed on this codebase and the Studio work.

---

## Handover prompt (copy from here)

```
I'm working on **tarotcardtemplates.com**, a Next.js 14 App Router site (TypeScript, Tailwind, Supabase, Netlify). Here's where things are at.

**Project summary**
- Marketplace for tarot card templates and borders. Public pages use existing patterns (templates, borders, blog, etc.).
- A new section called **Studio** lets users design a deck card-by-card after purchasing a border: upload art, set numeral/name, generate each card via Templated.io, then review and download a ZIP.

**What’s already done (Studio)**
1. **Auth:** Supabase Auth with @supabase/ssr. Browser client in `src/lib/supabase-client.ts` (session in cookies, use this for any client-side Supabase so RLS works). Server/client helpers in `src/lib/supabase-server.ts` (createServerClient for cookies, createServiceClient for service role). Login/signup at `/auth/login`, `/auth/signup`.
2. **Middleware:** `middleware.ts` at repo root protects `/studio/*` and `/account/*`; redirects unauthenticated users to `/auth/login?redirect=...`.
3. **Database:** Tables `purchases`, `decks`, `cards` with RLS (user-scoped). SQL in `supabase/migrations/20250313000000_studio_tables.sql` (run in Supabase SQL editor). Storage bucket `card-artwork` (public) for uploads.
4. **Checkout:** `/api/checkout` supports (a) border purchase: JSON body with borderSlug, borderName, templatedTemplateId, suiteSize, cardCount, amountPence; creates Stripe session, returns `{ url }`; (b) legacy template/print flow unchanged.
5. **Webhook:** `/api/webhooks/stripe` on checkout.session.completed creates purchase + deck + seed card rows. Uses raw body for Stripe signature verification.
6. **Studio APIs:** GET `/api/studio/session?session_id=` (post-checkout deck lookup), POST `/api/studio/upload`, PATCH `/api/studio/card`, POST `/api/studio/render` (calls Templated.io, saves render_url, increments completed_cards). All use Supabase SDK on server; API key and Templated.io only server-side.
7. **Studio pages:** `/studio` (list decks, redirect when session_id present), `/studio/[deckId]` (two-panel designer: preview + upload/numeral/name, Generate, Save & Next, one card at a time), `/studio/[deckId]/review` (grid, re-edit link, Download Deck), `/studio/[deckId]/download` (JSZip of render URLs). Designer uses **session-aware** `createClient()` from `@/lib/supabase-client` for Supabase (anon-only client returns 0 rows → RLS blocks → .single() 406).
8. **Borders:** `borders/[slug]` has `templated_template_id`; `BorderPurchase` component with pricing (Single / Major Arcana 22 / Full 78) and Purchase → `/api/checkout`. Vintage Velvet template ID: `669959c5-4cca-476b-a484-5a9b1158e2a4`. Layers: card-artwork, card-title, card-numeral.
9. **Design:** Studio uses main site design system (cream #f4f1ea, parchment #ede5d8, charcoal, cardBg #faf9f5; system fonts; primary/ghost buttons). No burgundy/gold or custom fonts.

**Constraints to respect**
- Netlify 10s function timeout: render cards one at a time from the client (call /api/studio/render per card), not bulk on server.
- Templated.io and Stripe secrets only on server; never expose in frontend.
- For any client-side Supabase data (decks, cards): use `createClient()` from `@/lib/supabase-client` so the user JWT is sent and RLS returns rows. Plain createClient(url, anonKey) with no session causes 0 rows and 406 with .single().

**Env (see .env.example):** NEXT_PUBLIC_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY, STRIPE_*, TEMPLATED_API_KEY, NEXT_PUBLIC_SITE_URL.

**Docs:** Full Studio summary and file list in `docs/STUDIO.md`. Main README links to it as "Studio README".

Please read `docs/STUDIO.md` and the key files (middleware, supabase-client, supabase-server, studio pages, api/studio routes) if you need to change or extend the Studio. Keep the same patterns (session-aware client in browser, service role only on server, one render per request).
```

---

## End of handover prompt (copy to here)
