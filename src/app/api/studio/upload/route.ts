import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

const LEGACY_BUCKET = 'card-artwork';
const STUDIO_BUCKET = 'studio-uploads';

/** Avoid Edge quirks with multipart; ensure full Node body parsing for FormData. */
export const runtime = 'nodejs';

/**
 * Upload artwork for the current Studio card: stored permanently in the user's artwork library
 * and linked via `studio_artwork` (path: `{userId}/artwork-library/{uuid}.ext`).
 */
export async function POST(request: Request) {
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error('[studio/upload] formData parse failed', e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Could not read upload body. Use FormData and let the browser set Content-Type (including boundary).',
      },
      { status: 400 },
    );
  }

  const rawUpload = formData.get('file') ?? formData.get('image');
  const file = rawUpload instanceof File && rawUpload.size > 0 ? rawUpload : null;
  const deckIdRaw = formData.get('deckId') ?? formData.get('deck_id');
  const cardIndexRaw = formData.get('cardIndex') ?? formData.get('card_index');
  const deckId = typeof deckIdRaw === 'string' ? deckIdRaw : deckIdRaw != null ? String(deckIdRaw) : null;
  const cardIndex = typeof cardIndexRaw === 'string' ? cardIndexRaw : cardIndexRaw != null ? String(cardIndexRaw) : null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!deckId || !deckId.trim()) {
    return NextResponse.json({ error: 'Missing deckId' }, { status: 400 });
  }
  if (!cardIndex || !cardIndex.trim()) {
    return NextResponse.json({ error: 'Missing cardIndex' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const deckIdTrim = deckId.trim();

  const { data: studioDeck } = await supabase
    .from('studio_decks')
    .select('id')
    .eq('id', deckIdTrim)
    .eq('user_id', user.id)
    .maybeSingle();

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'png';
  const fileExt = ext || 'png';

  if (studioDeck) {
    const fileId = randomUUID();
    const filePath = `${user.id}/artwork-library/${fileId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(STUDIO_BUCKET).upload(filePath, buffer, {
      contentType: file.type || 'image/png',
      upsert: false,
    });

    if (uploadError) {
      console.error('[studio/upload]', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: signed, error: signErr } = await supabase.storage.from(STUDIO_BUCKET).createSignedUrl(filePath, 3600);

    if (signErr || !signed?.signedUrl) {
      console.error('[studio/upload] sign', signErr);
      return NextResponse.json({ error: 'Upload saved but sign failed' }, { status: 500 });
    }

    const { data: artRow, error: artErr } = await supabase
      .from('studio_artwork')
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_url: signed.signedUrl,
        original_filename: file.name || null,
      })
      .select('id')
      .single();

    if (artErr || !artRow?.id) {
      console.error('[studio/upload] studio_artwork insert', artErr);
      await supabase.storage.from(STUDIO_BUCKET).remove([filePath]);
      return NextResponse.json({ error: 'Failed to save artwork library entry' }, { status: 500 });
    }

    return NextResponse.json({
      url: signed.signedUrl,
      path: filePath,
      artworkId: artRow.id,
    });
  }

  const { data: purchaseDeck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckIdTrim)
    .eq('user_id', user.id)
    .single();

  if (!purchaseDeck) {
    return NextResponse.json({ error: 'Deck not found or access denied' }, { status: 403 });
  }

  const safeCardIndex = cardIndex.trim();
  const legacyPath = `${deckIdTrim}/${safeCardIndex}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(LEGACY_BUCKET)
    .upload(legacyPath, buffer, {
      contentType: file.type || 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage.from(LEGACY_BUCKET).getPublicUrl(uploadData.path);
  return NextResponse.json({ url: urlData.publicUrl, path: uploadData.path });
}
