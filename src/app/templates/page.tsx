import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllTemplates } from "@/lib/templates";
import TemplateCard from "@/components/template-card";
import { fetchBorders, FALLBACK_BORDER_IMAGE } from "@/data/borders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarot Card Templates",
  description: "Browse our collection of professionally designed tarot card templates.",
  alternates: { canonical: "/templates" },
};

export default async function TemplatesPage() {
  const templates = await getAllTemplates();
  const borders = await fetchBorders();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
      <p className="mt-3 text-charcoal/70">
        Choose from our collection of print-ready tarot card designs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {borders.length === 0 && (
          <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
            No border templates are available right now. Check your database connection or try again later.
          </p>
        )}
        {/* Border templates (Marble Temple, etc.) — appear when you click View all */}
        {borders.map((border) => (
          <Link
            key={border.slug}
            href={`/borders/${border.slug}`}
            className="border border-charcoal/10 bg-white flex flex-col h-full transition-colors hover:border-charcoal/20"
          >
            <div className="relative aspect-[2/3] w-full max-h-96">
              <Image
                src={border.image ?? FALLBACK_BORDER_IMAGE}
                alt={border.name}
                fill
                className="object-contain p-3"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold">{border.name}</h2>
              <p className="mt-3 text-sm text-charcoal/80 flex-grow">
                {border.description}
              </p>
              <p className="mt-4 text-sm font-medium">Border template: $9.95</p>
              <span className="mt-4 inline-block border border-charcoal bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-cream transition-colors text-center">
                View template
              </span>
            </div>
          </Link>
        ))}

        {templates.length === 0 && (
          <p className="text-sm text-charcoal/70 sm:col-span-2 lg:col-span-3">
            No deck templates are available right now. Check your Supabase REST configuration or try again later.
          </p>
        )}
        {templates.map((template) => (
          <Link key={template.slug} href={`/templates/${template.slug}`}>
            <TemplateCard template={template} />
          </Link>
        ))}
      </div>
    </div>
  );
}
