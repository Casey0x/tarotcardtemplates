import { NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { isStudioExportType, type StudioExportType } from '@/lib/studio-export-constants';
import {
  buildStudioExportZip,
  StudioExportTimeoutError,
  zipResponseHeaders,
  withExportBuildTimeout,
} from '@/lib/studio-export-zip';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EXPORT_TIMEOUT_MESSAGE =
  'Your deck is taking longer than expected — please try Download again';

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

  let zip;
  try {
    zip = await withExportBuildTimeout(buildStudioExportZip(admin, deckId, exportType));
  } catch (e) {
    if (e instanceof StudioExportTimeoutError) {
      return NextResponse.json(
        { error: EXPORT_TIMEOUT_MESSAGE, code: 'EXPORT_TIMEOUT' },
        { status: 504 },
      );
    }
    throw e;
  }

  if (!zip.ok) {
    return NextResponse.json(
      { error: zip.error, missingIndices: zip.missingIndices },
      { status: 400 },
    );
  }

  const webStream = Readable.toWeb(zip.nodeStream) as ReadableStream<Uint8Array>;
  return new NextResponse(webStream, { headers: zipResponseHeaders() });
}
