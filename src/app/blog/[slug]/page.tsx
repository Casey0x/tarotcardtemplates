import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPostBySlug } from '@/data/blog';
import { JsonLd } from '@/components/json-ld';
import { blogPostingJsonLd } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/site';

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug
  }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post not found | Tarot Template Blog'
    };
  }

  return {
    title: `${post.title} | Tarot Template Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl space-y-8">
      <JsonLd data={blogPostingJsonLd(post)} />
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.14em] text-charcoal/70">{post.category}</p>
        <h1 className="text-4xl font-semibold leading-tight">{post.title}</h1>
        <p className="text-sm text-charcoal/70">
          {post.dateISO} · {post.readingTime}
        </p>
        <p className="max-w-2xl text-lg text-charcoal/80">{post.excerpt}</p>
      </header>

      <div className="space-y-5 text-charcoal/85">
        {post.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="flex gap-4 border-t border-charcoal/15 pt-8">
        <Link href="/templates" className="border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream">
          Browse templates
        </Link>
        <Link href="/how-it-works" className="border border-charcoal px-5 py-3 text-sm">
          How it works
        </Link>
      </footer>
    </article>
  );
}
