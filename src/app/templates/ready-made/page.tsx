import Link from "next/link";
import { getAllTemplates } from "@/lib/templates";
import TemplateCard from "@/components/template-card";
import type { Metadata } from "next";
import { getUserCurrency } from "@/lib/getUserCurrency";
import { formatUsdAsLocalCurrency } from "@/lib/formatPrice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ready-Made Tarot Card Templates | TarotCardTemplates.com",
  description: "Browse our collection of professionally designed tarot card templates.",
  alternates: { canonical: "/templates/ready-made" },
};

export default async function ReadyMadeTemplatesPage() {
  const templates = await getAllTemplates();
  const { currency } = getUserCurrency();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Ready-Made Tarot Card Templates</h1>
      <p className="mt-3 text-charcoal/70">
        Choose from our collection of print-ready tarot card designs.
      </p>

      {templates.length === 0 ? (
        <p className="mt-12 text-center text-charcoal/50">No templates available yet. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link key={template.slug} href={`/templates/${template.slug}`}>
              <TemplateCard
                template={template}
                templatePriceDisplay={formatUsdAsLocalCurrency(template.templatePrice, currency)}
                currencyCode={currency}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
