# Studio — Tarot Deck Designer

The **Studio** is a new section of tarotcardtemplates.com where users design their purchased border template card-by-card, then download a ZIP of rendered cards.

---

## Overview

- **Routes:** `/studio`, `/studio/[deckId]`, `/studio/[deckId]/review`, `/studio/[deckId]/download`
- **Auth:** Protected by middleware; unauthenticated users are redirected to `/auth/login`
- **Design:** Matches the main site (cream/parchment/charcoal, system fonts, minimal editorial look). Workspace area uses `#ede5d8` (parchment) to signal “tool mode”.

---

## User flow

1. User browses **Borders** at `/borders`, chooses a border (e.g. Vintage Velvet).
2. Clicks **Purchase** → Stripe Checkout (Single / Major Arcana 22 / Full Deck 78).
3. After payment → redirected to `/studio?session_id=...` → app resolves the new deck and redirects to `/studio/[deckId]`.
4. For each card: upload artwork, pick numeral, type name → **Generate** (one card at a time, server calls Templated.io) → **Save & Next**.
5. Repeat for all cards in the suite (22 or 78).
6. **Review** page: grid of rendered cards, re-edit any, **Download Deck**.
7. **Download** page: JSZip bundles all render URLs into a ZIP; user downloads.

---

## What was built (summary)

### 1. Dependencies

- `@supabase/supabase-js` — Supabase client (auth + data)
- `@supabase/ssr` — Cookie-based auth for Next.js (middleware + server/client helpers)
- `stripe`, `@stripe/stripe-js` — Checkout and (optional) client-side Stripe
- `jszip` — ZIP generation for deck download

### 2. Environment variables

Documented in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (existing)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, for studio/admin and storage
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `TEMPLATED_API_KEY` — server-only, never in frontend
- `NEXT_PUBLIC_SITE_URL` — for Stripe redirects

Supabase Storage: create a **public** bucket named `card-artwork` for studio uploads.

### 3. Middleware

- **File:** `middleware.ts` (project root)
- **Protects:** `/studio/*`, `/account/*`
- **Behaviour:** Uses Supabase SSR to get session; if no session, redirects to `/auth/login?redirect=...`

### 4. Supabase Auth

- **Browser client:** `src/lib/supabase-client.ts` — `createBrowserClient` from `@supabase/ssr` (session in cookies, sends JWT so RLS works).
- **Server client:** `src/lib/supabase-server.ts` — `createServerClient` (cookies) and `createServiceClient()` (service role, bypasses RLS).
- **Pages:** `/auth/login`, `/auth/signup` — standard email/password; login supports `?redirect=` for post-auth redirect.

### 5. Database (Supabase)

Run the SQL in `supabase/migrations/20250313000000_studio_tables.sql` in the Supabase SQL editor:

- **purchases** — stripe_session_id, border_slug, border_name, templated_template_id, suite_size, card_count, amount_paid, user_id, status
- **decks** — user_id, purchase_id, border_*, templated_template_id, total_cards, completed_cards, status
- **cards** — deck_id, card_index, numeral, card_name, artwork_url, render_url, status (UNIQUE(deck_id, card_index))

RLS policies: users can only access their own purchases, decks, and cards.

### 6. Checkout and webhook

- **`/api/checkout` (POST):**  
  - **Border purchase:** expects `borderSlug`, `borderName`, `templatedTemplateId`, `suiteSize`, `cardCount`, `amountPence`; requires auth; creates Stripe Checkout Session; returns `{ url }`.  
  - **Legacy:** still supports `templateSlug` + `purchaseType` (template/print) for existing flows.

- **`/api/webhooks/stripe` (POST):**  
  On `checkout.session.completed`, creates `purchases` (status `paid`) and `decks`, seeds `cards` rows. Uses raw body for Stripe signature verification.

### 7. Studio APIs

- **GET `/api/studio/session?session_id=cs_xxx`** — Returns `{ deckId }` for post-checkout redirect (auth required).
- **POST `/api/studio/upload`** — Uploads image to Supabase bucket `card-artwork`; returns `{ url }` (auth required).
- **PATCH `/api/studio/card`** — Updates card draft (artwork_url, numeral, card_name) without rendering (auth + deck ownership).
- **POST `/api/studio/render`** — Verifies deck ownership; calls Templated.io with template + layers (`card-artwork`, `card-title`, `card-numeral`); saves render_url on card and increments deck completed_cards; returns `{ renderUrl }`.

All studio APIs use the Supabase SDK on the server (service role or auth client); no raw fetch to Supabase from the server.

### 8. Studio pages

- **`/studio`** — Lists user’s decks; if `?session_id=` is present, fetches deck and redirects to `/studio/[deckId]`. Uses session-aware Supabase client for RLS.
- **`/studio/[deckId]`** — Two-panel designer: left = card preview (rendered or draft), right = upload artwork, numeral grid (0–XXI for 22, plus more for 78), card name with Major Arcana suggestions, **Generate**, **Save & Next**. Progress pills at top. Renders **one card at a time** (Netlify 10s timeout). Data fetching uses **session-aware** `createClient()` from `@/lib/supabase-client` so RLS returns the user’s deck/cards (avoiding 406 “Cannot coerce to single JSON object” when using anon-only client).
- **`/studio/[deckId]/review`** — Grid of rendered cards; link to re-edit (`?card=N`); **Download Deck** → download page.
- **`/studio/[deckId]/download`** — Builds ZIP of all card render URLs via JSZip; triggers download.

### 9. Borders integration

- **`src/app/borders/[slug]/page.tsx`** — Border data includes `templated_template_id` (e.g. Vintage Velvet: `669959c5-4cca-476b-a484-5a9b1158e2a4`). Purchase box uses `BorderPurchase` component.
- **`src/components/border-purchase.tsx`** — Pricing options: Single card, Major Arcana (22), Full deck (78). **Purchase** calls `/api/checkout` with border payload; on 401 redirects to login. Only borders with `templated_template_id` get the full Stripe + Studio flow.

### 10. Config and UI

- **next.config.mjs** — `images.domains` includes Supabase and `templated-assets.s3.amazonaws.com`.
- **tailwind.config.ts** — Colors: `cream`, `parchment`, `charcoal`, `cardBg`, `muted`. No burgundy/gold/studio-only fonts; studio uses main site design system.
- **Site header** — “Borders” and “Studio” added to nav.

---

## Important constraints

- **Netlify 10s function timeout** — Render cards one at a time from the client (call `/api/studio/render` per card), not in bulk on the server.
- **Templated.io** — Only called from the server (`/api/studio/render`); API key never in frontend.
- **Supabase** — Public pages can keep using raw fetch if needed; **Studio and auth use the Supabase JS SDK** (browser client with session for RLS, service role on server where appropriate).
- **Studio data in browser** — Use `createClient()` from `@/lib/supabase-client` (session-aware) so RLS sees the user and returns rows; anon-only client yields 0 rows and `.single()` → 406.

---

## Templated.io (Vintage Velvet)

- **Template ID:** `669959c5-4cca-476b-a484-5a9b1158e2a4`
- **Layer names:** `card-artwork` (image), `card-title` (text), `card-numeral` (text); `border-frame` and `Background` are locked.

---

## File reference

| Area | Path |
|------|------|
| Middleware | `middleware.ts` |
| Auth (client/server) | `src/lib/supabase-client.ts`, `src/lib/supabase-server.ts` |
| Auth pages | `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx` |
| SQL migration | `supabase/migrations/20250313000000_studio_tables.sql` |
| Checkout | `src/app/api/checkout/route.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| Studio APIs | `src/app/api/studio/session/`, `upload/`, `card/`, `render/` |
| Studio pages | `src/app/studio/page.tsx`, `src/app/studio/[deckId]/page.tsx`, `review/page.tsx`, `download/page.tsx` |
| Studio layout | `src/app/studio/layout.tsx` |
| Border purchase | `src/components/border-purchase.tsx` |
