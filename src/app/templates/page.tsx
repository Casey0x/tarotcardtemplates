import type { Metadata } from "next";
import { getAllTemplates } from "@/lib/templates";
import TemplateCard from "@/components/template-card";
import { getUserCurrency } from "@/lib/getUserCurrency";
import { formatTemplatePriceDisplay } from "@/lib/template-pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ready-Made Decks",
  description:
    "Complete 78-card tarot decks with original artwork — instant digital download.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesPage() {
  const { currency } = getUserCurrency();
  const templates = await getAllTemplates();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Ready-Made Decks</h1>
      <p className="mt-3 text-charcoal/70">
        Complete 78-card tarot decks with original artwork — instant digital download.
      </p>

      <section id="premade" className="mt-14 scroll-mt-24">
        <h2 className="text-2xl font-semibold text-charcoal">
          Pre-Made Tarot Decks — Ready to Download
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-charcoal/75">
          Complete 78-card tarot decks with original artwork. Instant digital download.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 && (
            <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
              No deck templates are available right now. Check your Supabase REST configuration or try again later.
            </p>
          )}
          {templates.map((template) => (
            <TemplateCard
              key={template.slug}
              template={template}
              templatePriceDisplay={formatTemplatePriceDisplay(currency)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
