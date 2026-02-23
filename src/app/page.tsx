import Link from 'next/link';
import { tarotTemplates } from '@/data/templates';
import { TemplateCard } from '@/components/template-card';

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-charcoal/70">TarotCardTemplates.com</p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
          Tarot Card Templates + Deck Printing
        </h1>
        <p className="max-w-3xl text-lg text-charcoal/80">
          Download print-ready tarot templates instantly — or order a professionally printed deck from any template.
        </p>
        <div className="flex gap-4">
          <Link href="/templates" className="border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream">
            Browse templates
          </Link>
          <Link href="/how-it-works" className="border border-charcoal px-5 py-3 text-sm">
            How it works
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured templates</h2>
          <Link href="/templates" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tarotTemplates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
