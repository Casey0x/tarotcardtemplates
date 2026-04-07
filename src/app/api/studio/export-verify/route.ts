import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { isStudioExportType, type StudioExportType } from '@/lib/studio-export-constants';
import { buildStudioExportZip, zipResponseHeaders } from '@/lib/studio-export-zip';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET ?session_id=&deck_id=&export_type=
 * Verifies paid Stripe Checkout, records studio_exports, returns ZIP of PNG renders.
 */
export async function GET(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id')?.trim() ?? '';
  const deckId = searchParams.get('deck_id')?.trim() ?? '';
  const exportTypeRaw = searchParams.get('export_type')?.trim() ?? '';

  if (!sessionId || !deckId || !isStudioExportType(exportTypeRaw)) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }
  const exportType = exportTypeRaw as StudioExportType;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = new Stripe(stripeSecret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    console.error('[studio/export-verify] retrieve', e);
    return NextResponse.json({ error: 'Could not verify payment session' }, { status: 502 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed', detail: session.payment_status }, { status: 402 });
  }

  const meta = session.metadata ?? {};
  if (meta.deckId !== deckId || meta.exportType !== exportType || meta.userId !== user.id) {
    return NextResponse.json({ error: 'Session does not match this export' }, { status: 403 });
  }

  const admin = createServiceClient();
  const { data: deck, error: deckErr } = await admin
    .from('studio_decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (deckErr) {
    console.error('[studio/export-verify] deck', deckErr);
    return NextResponse.json({ error: 'Deck lookup failed' }, { status: 500 });
  }
  if (!deck?.id) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  const { error: upsertErr } = await admin.from('studio_exports').upsert(
    {
      user_id: user.id,
      deck_id: deckId,
      export_type: exportType,
      stripe_session_id: sessionId,
    },
    { onConflict: 'user_id,deck_id,export_type' },
  );

  if (upsertErr) {
    console.error('[studio/export-verify] upsert', upsertErr);
    return NextResponse.json({ error: 'Failed to record export' }, { status: 500 });
  }

  const zip = await buildStudioExportZip(admin, deckId, exportType);
  if (!zip.ok) {
    return NextResponse.json(
      { error: zip.error, missingIndices: zip.missingIndices },
      { status: 400 },
    );
  }

  return new NextResponse(zip.buffer, { headers: zipResponseHeaders() });
}
