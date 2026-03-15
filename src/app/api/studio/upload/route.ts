import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

const BUCKET = 'card-art';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const deckId = formData.get('deckId') as string | null;
  const cardId = formData.get('cardId') as string | null;

  if (!file || !file.size) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!deckId || typeof deckId !== 'string' || !deckId.trim()) {
    return NextResponse.json({ error: 'Missing deckId' }, { status: 400 });
  }
  if (!cardId || typeof cardId !== 'string' || !cardId.trim()) {
    return NextResponse.json({ error: 'Missing cardId' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId.trim())
    .eq('user_id', session.user.id)
    .single();

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found or access denied' }, { status: 403 });
  }

  const ext = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'png';
  const filename = `art.${ext}`;
  const path = `cards/${deckId.trim()}/${cardId.trim()}/${filename}`;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 400 });
  }

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || 'image/png',
    upsert: true,
  });

  if (uploadError) {
    console.error('Upload error', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}
