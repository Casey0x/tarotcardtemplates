import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/templates";
import TemplateGallery from "@/components/template-gallery";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await getTemplateBySlug(params.slug);

  if (!template) {
    notFound();
  }

  const physicalDeckImage = "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/ASTRAL-DOMINION/physical%20deck.png";

  return (
    <article className="grid gap-10 lg:grid-cols-2">
      <section>
        <TemplateGallery
          images={template.previewImages ?? []}
          templateName={template.name}
        />

        <h1 className="mt-8 text-4xl font-semibold">
          {template.name}
        </h1>

        <p className="mt-3 text-charcoal/80">
          {template.description}
        </p>

        <p className="mt-4 text-sm">
          {template.styleNote}
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {template.includes.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <aside className="h-fit border border-charcoal/15 bg-white p-6">
        <h2 className="text-xl font-semibold">
          Purchase options
        </h2>

        <div className="mt-6 space-y-4">
          <form
            action="/api/checkout"
            method="post"
            className="space-y-2 border border-charcoal/10 p-4"
          >
            <input
              type="hidden"
              name="templateSlug"
              value={template.slug}
            />
            <input
              type="hidden"
              name="purchaseType"
              value="template"
            />

            <p className="font-medium">
              Buy template (${template.templatePrice.toFixed(2)})
            </p>

            <button
              type="submit"
              className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream"
            >
              Continue to checkout
            </button>

            <p className="mt-2 text-sm text-neutral-500">
              Instant digital download. Print-ready files included.
            </p>
          </form>

          <div className="border border-charcoal/10 p-4 overflow-hidden">
            <p className="mb-3 text-sm font-medium text-charcoal/70">
              The Printed Deck
            </p>
            <div className="overflow-hidden mb-3">
              <img
                src={physicalDeckImage}
                alt="Astral-Dominion printed deck"
                className="w-full h-auto transition-transform duration-300 hover:scale-110 cursor-pointer"
              />
            </div>
            <p className="text-xs text-charcoal/60">
              Professionally printed with premium card stock and luxe finishes
            </p>
          </div>

          <form
            action="/api/checkout"
            method="post"
            className="space-y-2 border border-charcoal/10 p-4"
          >
            <input
              type="hidden"
              name="templateSlug"
              value={template.slug}
            />
            <input
              type="hidden"
              name="purchaseType"
              value="print"
            />

            <p className="font-medium">
              Buy printed deck from template (${template.printPrice.toFixed(2)})
            </p>

            <button
              type="submit"
              className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream"
            >
              Continue to checkout
            </button>

            <p className="mt-2 text-sm text-neutral-500">
              Professionally printed and shipped. Single deck only in Phase 1.
            </p>
          </form>
        </div>

        <Link
          href="/how-it-works"
          className="mt-6 inline-block text-sm underline underline-offset-4"
        >
          Review how purchasing works
        </Link>
      </aside>
    </article>
  );
}
