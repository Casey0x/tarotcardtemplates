import Link from 'next/link';
import { fetchBorders, FALLBACK_BORDER_IMAGE } from '@/data/borders';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const borders = await fetchBorders();
  const heroBorders = borders.slice(0, 3);

  return (
    <div className="space-y-16 rounded-sm bg-[#f6f0e8] bg-[radial-gradient(circle_at_top,_rgba(214,186,140,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(155,126,189,0.16),_transparent_55%)]">

      {/* HERO */}
      <section className="relative -mx-8 overflow-hidden rounded-sm bg-gradient-to-b from-cream/95 via-cream/98 to-[#f6f0e8] px-8 py-12">
        <style>{`
          @keyframes heroFloatUp {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}
        </style>

        <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] text-charcoal/70">
              TarotCardTemplates.com
            </p>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
              Create Your Own Tarot Deck
            </h1>

            <p className="max-w-3xl text-lg text-charcoal/80">
              Professional tarot card templates designed for artists, tarot readers, and indie publishers.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/templates" className="rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream">
                Browse Templates
              </Link>

              <Link href="/how-it-works" className="rounded-sm border border-charcoal/80 bg-cream/90 px-6 py-3 text-sm font-medium text-charcoal">
                See How It Works
              </Link>
            </div>
          </div>

          <div className="pointer-events-none relative hidden h-72 md:block lg:h-80">
            <div
              className="absolute left-2 top-4 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95"
              style={{ animation: 'heroFloatUp 11s ease-in-out infinite' }}
            >
              <Image src={heroBorders[0]?.image ?? FALLBACK_BORDER_IMAGE} alt="" width={220} height={330} />
            </div>

            <div
              className="absolute left-24 top-10 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95"
              style={{ animation: 'heroFloatUp 12s ease-in-out infinite' }}
            >
              <Image src={heroBorders[1]?.image ?? FALLBACK_BORDER_IMAGE} alt="" width={220} height={330} />
            </div>

            <div
              className="absolute left-14 top-20 aspect-[3/5] w-32 overflow-hidden rounded-xs border border-charcoal/10 bg-cream/95"
              style={{ animation: 'heroFloatUp 13s ease-in-out infinite' }}
            >
              <Image src={heroBorders[2]?.image ?? FALLBACK_BORDER_IMAGE} alt="" width={220} height={330} />
            </div>
          </div>
        </div>
      </section>

      {/* BORDER TEMPLATES */}
      <section>
        <h2 className="text-2xl font-semibold">Border Templates</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {borders.slice(0, 3).map((border) => (
            <Link key={border.slug} href={`/borders/${border.slug}`}>
              <Image src={border.image ?? FALLBACK_BORDER_IMAGE} alt={border.name} width={200} height={300} />
              <h3>{border.name}</h3>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
