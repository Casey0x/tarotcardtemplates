import Link from 'next/link';
import { getAllTemplates } from '@/lib/templates';
import { TemplateCard } from '@/components/template-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const templates = await getAllTemplates();
  const featuredTemplate = templates.find((t) => t.featured) ?? templates[0];

  return (
    <main className="space-y-20">
      {/* Hero */}
      <section className="max-w-3xl space-y-6">
        <p className="text-xs tracking-widest text-charcoal/60">
          TAROTCARDTEMPLATES.COM
        </p>

        <h1 className="text-5xl font-semibold leading-tight">
          Tarot Card Templates + Deck Printing
        </h1>

        <p className="text-lg text-charcoal/80">
          Download print-ready tarot templates instantly — or order a
          professionally printed deck from any template.
        </p>

        <p className="text-sm text-charcoal/60">
          Templates from $18.95. Printed decks from $45.
        </p>

        <div className="flex gap-4">
          <Link
            href="/templates"
            className="border border-charcoal bg-charcoal px-6 py-3 text-sm text-cream"
          >
            Browse templates
          </Link>

          <Link
            href="/how-it-works"
            className="border border-charcoal px-6 py-3 text-sm"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featuredTemplate && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Featured template
            </h2>

            <Link
              href="/templates"
              className="text-sm underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <div className="max-w-md">
            <TemplateCard template={featuredTemplate} />
          </div>
        </section>
      )}
    </main>
  );
}
