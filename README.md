# TarotCardTemplates.com

A minimal marketplace for tarot card templates with Supabase-backed template management and custom deck printing options.

## 🎴 What This Is

A Next.js-powered marketplace where users can:
- Browse and purchase digital tarot card templates
- View interactive galleries with clickable previews
- Order professionally printed physical decks
- Download print-ready template files

**Live Site:** https://www.tarotcardtemplates.com

---

## 📖 Documentation

- **[Studio README](docs/STUDIO.md)** — Deck designer: auth, Stripe checkout, Templated.io render, Studio APIs and pages.

---

## Studio Card Generator Architecture

The Studio card generator lets users design deck cards by uploading artwork and editing metadata; the rendered preview is produced via the Templated API.

### Rendering pipeline

1. **User uploads artwork** in the Studio editor (per card).
2. **Artwork is stored in Supabase Storage** (bucket `card-art`).
3. **`artwork_url` is saved to the database** for the card (and shown in the UI).
4. **User edits card metadata** (title and numeral) in the Studio form.
5. **Studio calls `POST /api/studio/render`** with `deckId`, `cardId`, `artworkUrl`, `cardName`, `numeral`, and `templateId`.
6. **The backend sends a request to the Templated API** with the template and artwork URL.
7. **Templated renders the card** using the selected template and returns a render URL.
8. **`render_url` is returned** (and stored); the backend may persist it on the card.
9. **Studio displays the rendered preview** (e.g. via the card’s `render_url` or the response).

### Architecture diagram

```
Studio UI
    ↓
Supabase Auth
    ↓
Supabase Storage (artwork)
    ↓
Templated Render API
    ↓
Rendered Card Preview
```

### Key APIs

| Method & route | Purpose |
|----------------|--------|
| `POST /api/studio/upload` | Uploads artwork to Supabase Storage. Accepts `file`, `deckId`, `cardId`. Returns the public URL of the stored image. |
| `POST /api/studio/render` | Generates the card image via Templated. Accepts `deckId`, `cardId`, `artworkUrl`, `cardName`, `numeral`, `templateId`. Returns `renderUrl`. |

### Environment variables

Required for Studio and the render pipeline:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server; e.g. uploads). |
| `TEMPLATED_API_KEY` | API key for the Templated render service. |

### Storage

- **Bucket:** `card-art`
- **Path pattern:** `cards/{deckId}/{cardId}/art.png`  
  Example: `card-art/cards/abc-123/card-456/art.png`

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for template preview images)
- **Styling:** Tailwind CSS
- **Deployment:** Netlify
- **Language:** TypeScript

---

## 📁 Project Structure

```
tarotcardtemplates/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Homepage
│   │   ├── templates/
│   │   │   ├── page.tsx              # Templates gallery
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Template detail page
│   │   └── ...other pages
│   ├── components/
│   │   ├── template-card.tsx         # Template card component (homepage/gallery)
│   │   ├── template-gallery.tsx      # Interactive image gallery (client component)
│   │   └── site-header.tsx           # Site navigation
│   ├── lib/
│   │   ├── templates.ts              # Template data fetching & types
│   │   └── supabase-rest.ts          # Supabase REST API helpers
│   └── ...
├── public/                            # Static assets
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Netlify account (for deployment)

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Casey0x/tarotcardtemplates.git
   cd tarotcardtemplates
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## 🗄️ Database Schema

### `templates` table (Supabase)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `slug` | text | URL-friendly identifier (e.g., "astral-dominion") |
| `name` | text | Display name (e.g., "Astral-Dominion") |
| `description` | text | Template description |
| `style_note` | text | Additional style notes |
| `includes` | text[] | Array of what's included (e.g., "78 card fronts") |
| `template_price` | numeric | Digital template price |
| `print_price` | numeric | Printed deck price |
| `featured` | boolean | Show on homepage? |
| `preview_images` | text[] | Array of Supabase Storage URLs |
| `download_file_url` | text | URL to downloadable template file (nullable) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

---

## 📦 Adding a New Template

### Step 1: Prepare Images

You'll need at least 3 images:
1. **Thumbnail/Hero** - Single card (e.g., "The Fool")
2. **Card Spread** - Multiple cards displayed together
3. **Front/Back** - Showing both sides of cards
4. **Physical Deck** (optional) - Photo of printed product

**Recommended dimensions:**
- Individual cards: 2:3 aspect ratio (e.g., 800×1200px)
- Spread/mockups: As needed, optimize for web

### Step 2: Upload to Supabase Storage

1. Go to **Supabase Dashboard** → **Storage** → `template-previews` bucket
2. Create a folder with your template slug (e.g., `my-template-name`)
3. Upload your images:
   - `thumb.png` or `hero.png` - Main preview
   - `preview-1.png` - Card spread
   - `preview-2.png` - Front/back or another view
   - `physical-deck.png` (optional) - Physical product photo

4. Copy the full URLs - they'll look like:
   ```
   https://[project].supabase.co/storage/v1/object/public/template-previews/my-template-name/thumb.png
   ```

### Step 3: Add to Database

1. Go to **Supabase Dashboard** → **Table Editor** → `templates`
2. Click **Insert** → **Insert row**
3. Fill in the fields:

```json
{
  "slug": "my-template-name",
  "name": "My Template Name",
  "description": "A beautiful tarot deck with...",
  "style_note": "Best for readers wanting...",
  "includes": ["78 card fronts", "Print-ready bleed marks"],
  "template_price": 18.95,
  "print_price": 24.95,
  "featured": true,
  "preview_images": [
    "https://[project].supabase.co/storage/v1/object/public/template-previews/my-template-name/thumb.png",
    "https://[project].supabase.co/storage/v1/object/public/template-previews/my-template-name/preview-1.png",
    "https://[project].supabase.co/storage/v1/object/public/template-previews/my-template-name/preview-2.png"
  ]
}
```

**Important:** 
- `preview_images` must be an array with **single brackets** `[ ]`
- First image in the array is used as the thumbnail on homepage/gallery
- All subsequent images appear in the clickable gallery

### Step 4: Deploy

The site uses `force-dynamic` so changes appear immediately after Netlify redeploys. No code changes needed!

---

## 🎨 Key Features

### Interactive Gallery
- Clickable thumbnails on template detail pages
- Smooth image switching with CSS transitions
- Active thumbnail highlighting
- Built with React `useState` in a client component

**Code:** `src/components/template-gallery.tsx`

### Responsive Template Cards
- Optimized thumbnail sizing (`aspect-[2/3] max-h-96`)
- Clean editorial aesthetic
- Hover effects on buttons

**Code:** `src/components/template-card.tsx`

### Physical Deck Preview
- Shows high-quality product photo
- Hover zoom effect for detail inspection
- Positioned between purchase options

**Code:** `src/app/templates/[slug]/page.tsx` (line ~95)

---

## 🎯 Important Notes

### File Naming Conventions
- **Database fields:** `snake_case` (e.g., `preview_images`, `template_price`)
- **TypeScript types:** `camelCase` (e.g., `previewImages`, `templatePrice`)
- **Mapping:** Handled in `mapTemplateRow()` function in `src/lib/templates.ts`

### Image URLs
- Always use full Supabase Storage URLs
- Avoid spaces in filenames (or they'll be encoded as `%20`)
- Preferred format: `kebab-case.png` (e.g., `physical-deck.png`)

### Component Types
- **Server Components:** Most pages (can directly query database)
- **Client Components:** Interactive elements (marked with `'use client'`)
  - `template-gallery.tsx` - needs onClick handlers

### Deployment
- **Platform:** Netlify
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Environment variables:** Set in Netlify dashboard
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🐛 Common Issues & Fixes

### Images not showing after database update
**Problem:** Added images to database but they don't appear on site  
**Solution:** 
1. Check `preview_images` array format - must be `["url1","url2"]` not `[["url1","url2"]]`
2. Verify image URLs are publicly accessible
3. Trigger a Netlify redeploy

### Build fails with "TemplateCard is not exported"
**Problem:** Import error for components  
**Solution:** 
- Use `import TemplateCard from '@/components/template-card'` (default import)
- NOT `import { TemplateCard } from ...` (named import)

### Thumbnails not clickable
**Problem:** Gallery shows images but clicking doesn't work  
**Solution:**
1. Check `template-gallery.tsx` exists and has `'use client'` directive
2. Verify it's imported in `[slug]/page.tsx`
3. Check browser console for errors

---

## 📝 To-Do / Future Enhancements

- [ ] Add user authentication for purchases
- [ ] Implement actual checkout/payment flow
- [ ] Add template download functionality
- [ ] Create admin panel for template management
- [ ] Add search/filter functionality
- [ ] Implement reviews/ratings
- [ ] Add more templates!

---

## 🤝 Contributing

This is a private project, but if you're working on it:

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test locally: `npm run dev`
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Netlify will auto-deploy preview builds for branches

---

## 📧 Support

If something breaks and you need to remember how it works, check:
1. This README
2. Code comments in key files
3. Supabase dashboard for data structure
4. Netlify deploy logs for build errors

---

**Built with ✨ and a lot of vibe coding**

Last updated: February 2026
