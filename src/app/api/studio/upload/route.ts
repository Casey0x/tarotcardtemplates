import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

const LEGACY_BUCKET = 'card-artwork';
const STUDIO_BUCKET = 'studio-uploads';

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
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const deckId = formData.get('deckId') as string | null;
  const cardIndex = formData.get('cardIndex') as string | null;

  if (!file || !file.size) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!deckId || typeof deckId !== 'string' || !deckId.trim()) {
    return NextResponse.json({ error: 'Missing deckId' }, { status: 400 });
  }
  if (!cardIndex || typeof cardIndex !== 'string' || !cardIndex.trim()) {
    return NextResponse.json({ error: 'Missing cardIndex' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const deckIdTrim = deckId.trim();
  const safeCardIndex = cardIndex.trim();

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
    const filePath = `${user.id}/${deckIdTrim}/artwork-${safeCardIndex}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STUDIO_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from(STUDIO_BUCKET)
      .createSignedUrl(uploadData.path, 3600);

    if (signErr || !signed?.signedUrl) {
      console.error('Sign error', signErr);
      return NextResponse.json({ error: 'Upload saved but sign failed' }, { status: 500 });
    }

    return NextResponse.json({ url: signed.signedUrl, path: uploadData.path });
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
