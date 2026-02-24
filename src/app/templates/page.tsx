import Link from 'next/link';
import TemplateCard from '@/components/template-card';
import { getAllTemplates } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = await getAllTemplates();

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
          {templates.length > 0 ? (
            templates.map((template) => <TemplateCard key={template.slug} template={template} />)
          ) : (
            <p className="text-charcoal/80">Templates are being added. Check back shortly.</p>
          )}
        </div>
      </section>
    </div>
  );
}
