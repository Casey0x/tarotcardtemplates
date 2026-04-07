import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { getPublicSiteUrl } from '@/lib/site-url';
import { STUDIO_EXPORT_STRIPE_PRICE, isStudioExportType, type StudioExportType } from '@/lib/studio-export-constants';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let baseUrl: string;
  try {
    baseUrl = getPublicSiteUrl();
  } catch (e) {
    console.error('[studio/checkout] site URL', e);
    return NextResponse.json({ error: 'Server missing NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_BASE_URL' }, { status: 500 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { deckId?: string; exportType?: string };
  try {
    body = (await request.json()) as { deckId?: string; exportType?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const deckId = typeof body.deckId === 'string' ? body.deckId.trim() : '';
  const exportTypeRaw = typeof body.exportType === 'string' ? body.exportType.trim() : '';
  if (!deckId || !isStudioExportType(exportTypeRaw)) {
    return NextResponse.json({ error: 'Invalid deckId or exportType' }, { status: 400 });
  }
  const exportType = exportTypeRaw as StudioExportType;

  const admin = createServiceClient();
  const { data: deck, error: deckErr } = await admin
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr) {
    console.error('[studio/checkout] deck', deckErr);
    return NextResponse.json({ error: 'Deck lookup failed' }, { status: 500 });
  }
  if (!deck?.id) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  const priceId = STUDIO_EXPORT_STRIPE_PRICE[exportType];
  const stripe = new Stripe(stripeSecret);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/studio/export-success?session_id={CHECKOUT_SESSION_ID}&deck_id=${encodeURIComponent(deckId)}&export_type=${encodeURIComponent(exportType)}`,
    cancel_url: `${baseUrl}/studio-beta`,
    client_reference_id: user.id,
    metadata: {
      deckId,
      exportType,
      userId: user.id,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
