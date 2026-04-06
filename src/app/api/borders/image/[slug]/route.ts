import { readFile } from 'fs/promises';
import path from 'path';

import { createClient } from '@/lib/supabase-server';
import { resolveBorderImageSlug } from '@/lib/border-image-slug';

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await context.params;
  const { canonical: slug, ok } = resolveBorderImageSlug(rawSlug ?? '');
  if (!ok) {
    return new Response(null, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const url = new URL(req.url);
  const variant = url.searchParams.get('variant');
  const fileName = variant === 'transparent' ? `${slug}-transparent.png` : `${slug}.png`;
  const filePath = path.join(process.cwd(), 'private', 'borders', fileName);

  try {
    const buf = await readFile(filePath);
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    if (variant === 'transparent') {
      const fallbackPath = path.join(process.cwd(), 'private', 'borders', `${slug}.png`);
      try {
        const buf = await readFile(fallbackPath);
        return new Response(buf, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'private, max-age=3600',
          },
        });
      } catch {
        return new Response(null, { status: 404 });
      }
    }
    return new Response(null, { status: 404 });
  }
}
