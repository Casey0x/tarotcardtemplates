import { TemplateCard } from '@/components/template-card';
import { getTemplates } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div>
      <h1 className="text-4xl font-semibold">Templates gallery</h1>
      <p className="mt-3 max-w-2xl text-charcoal/80">
        Phase 1 includes a focused library of print-ready tarot template layouts.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.length > 0 ? (
          templates.map((template) => <TemplateCard key={template.slug} template={template} />)
        ) : (
          <p className="text-charcoal/80">Templates are being added. Check back shortly.</p>
        )}
      </div>
    </div>
  );
}
