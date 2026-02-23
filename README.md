# TarotCardTemplates.com — Phase 1

Minimal Phase 1 marketplace implementation for tarot templates with optional single-deck printing.

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

## Local development

```bash
npm install
npm run dev
```
