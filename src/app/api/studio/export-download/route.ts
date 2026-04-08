import { NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import {
  buildStudioDeckZipAllRendered,
  StudioExportTimeoutError,
  zipResponseHeaders,
  withExportBuildTimeout,
} from '@/lib/studio-export-zip';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EXPORT_TIMEOUT_MESSAGE =
  'Your deck is taking longer than expected — please try Download again';

/** GET ?deck_id= — free ZIP of all rendered cards for the user's deck. */
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deckId = new URL(request.url).searchParams.get('deck_id')?.trim() ?? '';
  if (!deckId) {
    return NextResponse.json({ error: 'Missing deck_id' }, { status: 400 });
  }

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

  let zip;
  try {
    zip = await withExportBuildTimeout(buildStudioDeckZipAllRendered(admin, deckId));
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
