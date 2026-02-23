import Link from 'next/link';
import { tarotTemplates } from '@/data/templates';
import { TemplateCard } from '@/components/template-card';

export default function TemplatesPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold">Templates gallery</h1>
        <p className="max-w-2xl text-charcoal/80">
          Phase 1 includes a focused library of print-ready tarot template layouts.
        </p>
        <div className="flex gap-4">
          <Link href="/how-it-works" className="border border-charcoal px-5 py-3 text-sm">
            How it works
          </Link>
          <Link href="/custom-printing" className="border border-charcoal px-5 py-3 text-sm">
            Custom printing
          </Link>
        </div>
      </header>

      <section>
        <div className="grid gap-6 md:grid-cols-3">
          {tarotTemplates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
