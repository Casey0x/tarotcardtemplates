import Link from "next/link";
import Image from "next/image";
import { getAllTemplates } from "@/lib/templates";
import { BORDER_STYLES } from "@/lib/borders";
import TemplateCard from "@/components/template-card";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Templates | Tarot Card Templates & Border Styles | TarotCardTemplates.com",
  description:
    "Choose from ready-made tarot card templates or tarot card border frames. Print-ready designs for creators and artists.",
};

export default async function TemplatesHubPage() {
  const templates = await getAllTemplates();
  const previewTemplates = templates.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>

      {/* SECTION 1 — Ready-Made Tarot Card Templates */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Ready-Made Tarot Card Templates</h2>
        <p className="text-charcoal/70">
          Pre-designed tarot card layouts ready to customise.
        </p>
        {previewTemplates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previewTemplates.map((template) => (
              <Link key={template.slug} href={`/templates/${template.slug}`}>
                <TemplateCard template={template} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-charcoal/50">No templates available yet. Check back soon.</p>
        )}
        <div>
          <Link
            href="/templates/ready-made"
            className="inline-block text-sm font-medium underline underline-offset-4 hover:text-charcoal/80"
          >
            Browse Ready-Made Templates →
          </Link>
        </div>
      </section>

      {/* SECTION 2 — Tarot Card Border Templates */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tarot Card Border Templates</h2>
        <p className="text-charcoal/70">
          Tarot card border frames for designing your own cards.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BORDER_STYLES.map((style) => (
            <Link
              key={style.slug}
              href={`/borders/${style.slug}`}
              className="group flex flex-col rounded-sm border border-charcoal/10 bg-cream/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400 hover:shadow-xl"
            >
              <div className="relative mb-4 overflow-hidden rounded-xs border border-charcoal/10 bg-cream p-3 aspect-[3/5]">
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-charcoal">{style.name}</h3>
              <p className="text-xs text-charcoal/80">{style.description}</p>
            </Link>
          ))}
        </div>
        <div>
          <Link
            href="/borders"
            className="inline-block text-sm font-medium underline underline-offset-4 hover:text-charcoal/80"
          >
            Browse Border Templates →
          </Link>
        </div>
      </section>
    </div>
  );
}
