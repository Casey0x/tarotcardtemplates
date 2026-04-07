import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { isStudioExportType, type StudioExportType } from '@/lib/studio-export-constants';
import { buildStudioExportZip, zipResponseHeaders } from '@/lib/studio-export-zip';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET ?deck_id=&export_type= — re-download ZIP for an export the user already purchased. */
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deckId = searchParams.get('deck_id')?.trim() ?? '';
  const exportTypeRaw = searchParams.get('export_type')?.trim() ?? '';
  if (!deckId || !isStudioExportType(exportTypeRaw)) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
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
    console.error('[studio/export-download] deck', deckErr);
    return NextResponse.json({ error: 'Deck lookup failed' }, { status: 500 });
  }
  if (!deck?.id) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  const { data: purchase, error: purchaseErr } = await admin
    .from('studio_exports')
    .select('id')
    .eq('user_id', user.id)
    .eq('deck_id', deckId)
    .eq('export_type', exportType)
    .maybeSingle();

  if (purchaseErr) {
    console.error('[studio/export-download] export row', purchaseErr);
    return NextResponse.json({ error: 'Purchase lookup failed' }, { status: 500 });
  }
  if (!purchase?.id) {
    return NextResponse.json({ error: 'No purchase found for this export' }, { status: 403 });
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
