import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBorderBySlug, formatBorderPriceLocalized } from '@/data/borders';
import { getUserCurrency } from '@/lib/getUserCurrency';
import { BorderPurchase } from '@/components/border-purchase';
import { createClient } from '@/lib/supabase-server';
import { fetchPurchasedBorderSlugsForUser } from '@/lib/user-purchases';

export const dynamic = 'force-dynamic';

export default async function BorderPurchasePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const border = await fetchBorderBySlug(slug);
  if (!border) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const purchasedSlugs = await fetchPurchasedBorderSlugsForUser();
  const ownsBorder = purchasedSlugs.includes(slug);
  const { currency } = getUserCurrency();
  const listPriceDisplay = formatBorderPriceLocalized(border, currency);

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <Link
        href={`/borders/${slug}`}
        className="text-sm text-charcoal/80 underline underline-offset-4 hover:text-charcoal"
      >
        ← Back to {border.name}
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-charcoal">Purchase {border.name}</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Choose a deck size and complete checkout, or open the Studio to try the border first.
      </p>
      <div className="mt-8">
        <BorderPurchase
          borderSlug={slug}
          borderName={border.name}
          templatedTemplateId={border.templatedTemplateId}
          isLoggedIn={isLoggedIn}
          ownsBorder={ownsBorder}
          listPriceDisplay={listPriceDisplay}
        />
      </div>
    </div>
  );
}
