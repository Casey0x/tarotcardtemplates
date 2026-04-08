import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BUCKET = 'studio-uploads';

/** GET — list current user's artwork library (newest first). */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: rows, error } = await admin
    .from('studio_artwork')
    .select('id, file_path, original_filename, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[studio/artwork-library] list', error);
    return NextResponse.json({ error: 'Failed to list artwork' }, { status: 500 });
  }

  const items = await Promise.all(
    (rows ?? []).map(async (r) => {
      const path = String(r.file_path ?? '').trim();
      let signed: string | null = null;
      if (path) {
        const { data: s } = await admin.storage.from(BUCKET).createSignedUrl(path, 3600);
        signed = s?.signedUrl ?? null;
      }
      return {
        id: r.id,
        file_path: path,
        preview_url: signed,
        original_filename: r.original_filename ?? null,
        created_at: r.created_at,
      };
    }),
  );

  return NextResponse.json({ items });
}

/** POST multipart — upload new image into artwork library. */
export async function POST(request: Request) {
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const raw = formData.get('file') ?? formData.get('image');
  const file = raw instanceof File && raw.size > 0 ? raw : null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'png';
  const safeExt = ext || 'png';
  const id = randomUUID();
  const filePath = `${user.id}/artwork-library/${id}.${safeExt}`;

  const admin = createServiceClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(filePath, buffer, {
    contentType: file.type || 'image/png',
    upsert: false,
  });

  if (uploadError) {
    console.error('[studio/artwork-library] upload', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: signed, error: signErr } = await admin.storage.from(BUCKET).createSignedUrl(filePath, 3600);
  if (signErr || !signed?.signedUrl) {
    console.error('[studio/artwork-library] sign', signErr);
    return NextResponse.json({ error: 'Upload saved but sign failed' }, { status: 500 });
  }

  const { data: row, error: insErr } = await admin
    .from('studio_artwork')
    .insert({
      user_id: user.id,
      file_path: filePath,
      file_url: signed.signedUrl,
      original_filename: file.name || null,
    })
    .select('id')
    .single();

  if (insErr || !row?.id) {
    console.error('[studio/artwork-library] insert', insErr);
    await admin.storage.from(BUCKET).remove([filePath]);
    return NextResponse.json({ error: 'Failed to save artwork record' }, { status: 500 });
  }

  return NextResponse.json({
    artworkId: row.id,
    path: filePath,
    url: signed.signedUrl,
  });
}

/** DELETE ?id= — remove library entry; studio_cards.artwork_id set NULL by FK. */
export async function DELETE(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id')?.trim() ?? '';
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data: art, error: fetchErr } = await admin
    .from('studio_artwork')
    .select('id, file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr || !art?.file_path) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const path = String(art.file_path).trim();
  const { error: delDb } = await admin.from('studio_artwork').delete().eq('id', id).eq('user_id', user.id);
  if (delDb) {
    console.error('[studio/artwork-library] delete db', delDb);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }

  const { error: delSt } = await admin.storage.from(BUCKET).remove([path]);
  if (delSt) {
    console.warn('[studio/artwork-library] delete storage', delSt.message);
  }

  return NextResponse.json({ ok: true });
}
