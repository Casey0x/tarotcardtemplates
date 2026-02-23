import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/data/templates";

export default function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = getTemplateBySlug(params.slug);

  if (!template) {
    notFound();
  }

  return (
    <article className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <section>
        <div className="aspect-[4/3] w-full bg-parchment" />

        <h1 className="mt-8 text-4xl font-semibold">{template.name}</h1>

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
        <h2 className="text-xl font-semibold">Purchase options</h2>

        <div className="mt-6 space-y-4">
          {/* Template Download */}
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

          {/* Printed Deck */}
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

        <p className="mt-6 text-xs text-charcoal/70">
          Stripe integration placeholder: set `STRIPE_SECRET_KEY` and replace
          TODO redirect in checkout handler.
        </p>

        <Link
          href="/how-it-works"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          Review how purchasing works
        </Link>
      </aside>
    </article>
  );
}