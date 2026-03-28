import Link from 'next/link';
import type { Metadata } from 'next';
import { blogPosts } from '@/data/blog';

export const metadata: Metadata = {
  title: 'Tarot Template Blog',
  description:
    'Practical notes for tarot creators: print-ready setup, deck production, materials, budgeting, and selling your deck.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold">Tarot Template Blog</h1>
        <p className="max-w-3xl text-charcoal/80">
          Practical notes for tarot creators working on real print and publishing workflows, from template setup to production and sales.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/templates" className="border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream">
            Browse templates
          </Link>
          <Link href="/how-it-works" className="border border-charcoal px-5 py-3 text-sm">
            How it works
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        {blogPosts.map((post) => (
          <article key={post.slug} className="space-y-3 border-b border-charcoal/15 pb-6">
            <p className="text-xs uppercase tracking-[0.14em] text-charcoal/70">{post.category}</p>
            <h2 className="text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:text-mutedGold transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-charcoal/80">{post.excerpt}</p>
            <p className="text-sm text-charcoal/70">
              {post.dateISO} · {post.readingTime}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
