# Adding a New Template to TarotCardTemplates.com

No code changes or redeployments are needed. Everything is database-driven — once you complete the steps below, the template will appear on the site automatically.

---

## Branch Workflow

**All changes go to `dev` first — never directly to `main`.**

- Work on the `dev` branch for all updates (database content, file uploads, documentation).
- When everything is verified and working correctly on `dev`, merge `dev` into `main`.
- Merging into `main` triggers a single Netlify deploy — this is the only moment the live site relaunches.
- This keeps deploys intentional and prevents the live site from updating mid-session.

---

## Checklist

### Step 1 — Upload images to Supabase Storage

Navigate to **Supabase → Storage → `template-previews`** and create a new folder named exactly after your template slug (uppercase, matching the `slug` field you'll insert in Step 2).

```
template-previews/
  YOUR-TEMPLATE-NAME/
      thumb.png          ← Used on the /templates listing grid
      preview-1.png      ← First image in the detail page gallery
      preview-2.png      ← Second image in the detail page gallery
      physical-deck.png  ← Printed deck photo shown in the purchase sidebar
```

**Required files — all four must be present:**

| File | Usage |
|---|---|
| `thumb.png` | Listing page card thumbnail |
| `preview-1.png` | Gallery image 1 on detail page |
| `preview-2.png` | Gallery image 2 on detail page |
| `physical-deck.png` | Printed deck photo in purchase sidebar |

**Naming rules:** Folder name must be UPPERCASE and match the slug field exactly (e.g. slug `Astral-Dominion` → folder `ASTRAL-DOMINION`). File names must be lowercase as shown above.

---

### Step 2 — Insert a row in the templates table

Navigate to **Supabase → SQL Editor** and run an INSERT statement, or use **Table Editor → templates → Insert row**.

**All database fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | text | ✅ | URL-safe identifier. Used in the page URL (`/templates/your-slug`) and to build storage paths. Use Title-Case-With-Hyphens (e.g. `Astral-Dominion`). |
| `name` | text | ✅ | Display name shown on the listing and detail pages (e.g. `Astral Dominion`). |
| `description` | text | ✅ | 1–3 sentence description of the template's style and feel. Shown on the detail page when no SEO content is set, and used in `<meta>` description tags. |
| `style_note` | text | ✅ | Short secondary note about design style or aesthetic (e.g. `Art Nouveau with gold celestial detailing`). Shown below description on the detail page fallback. |
| `includes` | text[] | ✅ | Array of what's included in the download. Each item shown as a bullet (e.g. `{"78 card fronts (300 DPI)","Print-ready PDF","Bleed marks included"}`). |
| `template_price` | numeric | ✅ | Price of the digital download in NZD (e.g. `49.00`). |
| `print_price` | numeric | ✅ | Price of the printed physical deck in NZD (e.g. `129.00`). |
| `featured` | boolean | ✅ | Set to `true` to pin this template to the top of the listing page. Use sparingly. |
| `preview_images` | text[] | ✅ | Must be a single array of full Supabase Storage URLs for gallery images, in display order. |

> ⚠️ **`preview_images` note:** This must be a Postgres array literal — not a JSON string, not two separate fields. Both URLs in a single `{}` array. The physical deck image (`physical-deck.png`) is not included here — it's loaded automatically from storage using the slug.

---

### Step 3 — Choose and configure the 4 card meaning links

Each template detail page shows an **"Explore Tarot Card Meanings"** section at the bottom, displaying 4 cards with images and links to their card meaning pages.

**Rules for selecting the 4 cards:**

- **Cards must be unique per template** — do not reuse the same 4 cards across multiple templates. Each template should have its own distinct set.
- **Cards must match the deck's theme and aesthetic** — choose cards whose symbolism and visual style align with the template's mood.
- **Each card meaning page must already exist in the `card_meanings` table** before you link to it. If the page doesn't exist yet, build it first.
- **Card images must use that deck's own artwork only** — never mix artwork from different decks. Each image must be the version created for this specific template.
- Images are uploaded to **Supabase Storage** at `public/images/[card-slug].jpg` (e.g. `/images/the-star.jpg`).

**Current card selections per template:**

| Template | Card 1 | Card 2 | Card 3 | Card 4 |
|---|---|---|---|---|
| Astral-Dominion | The Star | The Moon | The Magician | The Fool |
| Cosmic-Void | Three of Swords | Strength | Six of Cups | King of Wands |
| Dream-Scape | The Hermit | Nine of Cups | Seven of Pentacles | Page of Pentacles |

When adding a new template, choose 4 cards not already used by the existing templates above, then update this table.

---

### Step 4 — (Optional) Add SEO content

The 8 `seo_*` fields are all optional. If left empty (`null`), the template detail page will display the standard `description`, `style_note`, and `includes` fallback. Populate these to add richer on-page SEO content with headings, bullet lists, and a card spotlight section.

| Field | Type | Description |
|---|---|---|
| `seo_heading` | text | Main H2 below the template name. Setting this activates the full SEO content block. |
| `seo_description` | text | Descriptive paragraph rendered below `seo_heading`. Aim for 3–5 sentences with natural keyword usage. |
| `seo_perfect_for` | text[] | Array of bullet items for the "Perfect for:" list. |
| `seo_symbolism_heading` | text | H3 heading for a symbolism/theme section. |
| `seo_symbolism_body` | text | Paragraph body for the symbolism section. |
| `seo_card_spotlight_heading` | text | H3 heading for a specific card callout. |
| `seo_card_spotlight_body` | text | Paragraph describing how that card appears in this deck. |
| `seo_card_spotlight_link` | text | Internal link path for the card meaning page (e.g. `/card-meanings/the-fool`). Rendered as "Explore the full interpretation →". |

> **Tip:** You only need `seo_heading` populated to activate the SEO block. The other fields render conditionally — leave any you don't need as `null`.

---

### Step 5 — Verify

- Visit `https://www.tarotcardtemplates.com/templates` — the new template card should appear
- Click through to `https://www.tarotcardtemplates.com/templates/your-slug` — confirm images, pricing, and content all display correctly
- If SEO fields were populated, check the heading and content sections appear below the template name
- Test the sticky mobile purchase bar by resizing the browser window
- Check that the **"Explore Tarot Card Meanings"** section at the bottom displays all 4 card links correctly, with the right deck artwork for each card
- Confirm all 4 card meaning links go to valid, live pages (no 404s)

---

## Example SQL Insert

```sql
INSERT INTO templates (
  slug,
  name,
  description,
  style_note,
  includes,
  template_price,
  print_price,
  featured,
  preview_images,
  -- Optional SEO fields
  seo_heading,
  seo_description,
  seo_perfect_for,
  seo_symbolism_heading,
  seo_symbolism_body,
  seo_card_spotlight_heading,
  seo_card_spotlight_body,
  seo_card_spotlight_link
) VALUES (
  'Your-Template-Slug',
  'Your Template Name',
  'A compelling description of the template style and what makes it unique.',
  'Style note — e.g. Minimalist with bold geometric borders',
  ARRAY[
    '78 high-resolution card fronts (300 DPI)',
    'Print-ready with bleed settings',
    'Standard size: 70 x 120mm',
    'Instant digital download'
  ],
  49.00,
  129.00,
  false,
  ARRAY[
    'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/YOUR-TEMPLATE-NAME/preview-1.png',
    'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/YOUR-TEMPLATE-NAME/preview-2.png'
  ],
  -- Leave SEO fields as NULL to use the description/style_note fallback
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
```

---

## Quick Reference

| What | Where |
|---|---|
| Add/edit template content | Supabase → Table Editor → `templates` |
| Upload/replace template images | Supabase → Storage → `template-previews` |
| Upload card meaning images | Supabase → Storage → `public/images/` |
| Reorder listing page | Update `featured` flag or adjust `name` (listing sorts by `featured desc`, then `name asc`) |
| Add SEO content later | Update the `seo_*` columns for that row — takes effect immediately |
| Deploying changes | Merge `dev` into `main` on GitHub — triggers a single Netlify build |
