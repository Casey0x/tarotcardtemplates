# TarotCardTemplates.com — Phase 2A

Minimal marketplace implementation for tarot templates with Sanity CMS-backed template management.

## Included pages

- `/`
- `/templates`
- `/templates/[slug]`
- `/how-it-works`
- `/custom-printing`
- `/account`
- `/download` (post-purchase delivery page)

## Pricing

- Template download: **$18.95**
- Optional printed deck from template (single deck): **$45**

## Checkout notes

Checkout routes are stubbed in `src/app/api/checkout/route.ts`.

- Template purchases redirect to `/download`
- Printed deck purchases create an in-memory print order with status `ordered` and redirect to `/account`
- Add Stripe integration where marked with TODO comments

## Next.js local development

```bash
npm install
npm run dev
```

## Sanity CMS setup

### 1) Create a Sanity project

From the repository root:

```bash
cd sanity
npm install
npx sanity init
```

During init, choose/create a project and dataset (recommended: `production`).

### 2) Configure environment variables

Set these in local `.env.local` for Next.js and in Netlify site environment variables:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION` (fixed date string, for example `2025-01-01`)

Only add `SANITY_READ_TOKEN` if your dataset is private. Public datasets can use unauthenticated read access.

For local Studio development, you can also provide:

- `SANITY_STUDIO_PROJECT_ID` (optional; falls back to `SANITY_PROJECT_ID`)
- `SANITY_STUDIO_DATASET` (optional; falls back to `SANITY_DATASET`)

### 3) Run the Studio locally

```bash
cd sanity
npm run dev
```

This launches Sanity Studio with the `template` schema used by the website.
