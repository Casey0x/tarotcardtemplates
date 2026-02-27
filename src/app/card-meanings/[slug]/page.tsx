import { notFound } from 'next/navigation';
import { getCardMeaningBySlug } from '@/lib/card-meanings';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const card = await getCardMeaningBySlug(params.slug);
  if (!card) return { title: 'Card Not Found' };
  return {
    title: `${card.name} Tarot Card Meaning — Upright, Reversed & More | TarotCardTemplates.com`,
    description: `Discover the full ${card.name} tarot card meaning — upright and reversed, love, career, health, yes or no, and more. Deep interpretations for every reading.`,
  };
}

export default async function CardMeaningPage({
  params,
}: {
  params: { slug: string };
}) {
  const card = await getCardMeaningBySlug(params.slug);
  if (!card) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        {card.number && (
          <p className="text-sm text-charcoal/50 uppercase tracking-widest mb-2">
            {card.arcana === 'major' ? `Major Arcana · ${card.number}` : card.arcana}
          </p>
        )}
        <h1 className="text-4xl font-semibold text-charcoal">
          {card.name} Tarot Card Meaning
        </h1>
        {card.uprightKeywords && (
          <div className="mt-4 flex flex-wrap gap-2">
            {card.uprightKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs border border-charcoal/20 px-3 py-1 text-charcoal/60"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {card.featuredImageUrl && (
        <img
          src={card.featuredImageUrl}
          alt={`${card.name} tarot card`}
          className="w-48 mx-auto mb-10"
        />
      )}

      <div className="space-y-10">
        {card.uprightMeaning && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Upright Meaning</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.uprightMeaning}</p>
          </section>
        )}
        {card.reversedMeaning && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Reversed Meaning</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.reversedMeaning}</p>
          </section>
        )}
        {card.love && (
          <section>
            <h2 className="text-xl font-semibold mb-3">
              {card.name} Tarot Meaning &mdash; Love &amp; Relationships
            </h2>
            <p className="text-charcoal/80 leading-relaxed">{card.love}</p>
          </section>
        )}
        {card.career && (
          <section>
            <h2 className="text-xl font-semibold mb-3">
              {card.name} Tarot Meaning &mdash; Career
            </h2>
            <p className="text-charcoal/80 leading-relaxed">{card.career}</p>
          </section>
        )}
        {card.health && (
          <section>
            <h2 className="text-xl font-semibold mb-3">
              {card.name} Tarot Meaning &mdash; Health
            </h2>
            <p className="text-charcoal/80 leading-relaxed">{card.health}</p>
          </section>
        )}
        {card.yesOrNo && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{card.name} &mdash; Yes or No?</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.yesOrNo}</p>
          </section>
        )}
        {card.asAPerson && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{card.name} as a Person</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.asAPerson}</p>
          </section>
        )}
        {card.feelings && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{card.name} &mdash; Feelings</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.feelings}</p>
          </section>
        )}
        {card.advice && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{card.name} &mdash; Advice</h2>
            <p className="text-charcoal/80 leading-relaxed">{card.advice}</p>
          </section>
        )}
      </div>
    </main>
  );
}
