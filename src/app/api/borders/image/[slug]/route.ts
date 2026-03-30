import { readFile } from 'fs/promises';
import path from 'path';

import { BORDER_TEMPLATES } from '@/data/border-templates-static';
import { createClient } from '@/lib/supabase-server';
import { userOwnsBorderForUserId } from '@/lib/user-purchases';

const ALLOWED = new Set(BORDER_TEMPLATES.map((b) => b.slug));

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug || !ALLOWED.has(slug)) {
    return new Response(null, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(null, { status: 403 });
  }

  const owns = await userOwnsBorderForUserId(user.id, slug);
  if (!owns) {
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('trial_renders_used')
      .eq('id', user.id)
      .maybeSingle();

    let trialAllowed = true;
    if (!profErr) {
      const used = (prof as { trial_renders_used?: number } | null)?.trial_renders_used ?? 0;
      trialAllowed = used < 2;
    }

    if (!trialAllowed) {
      return new Response(null, { status: 403 });
    }
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
    return new Response(null, { status: 404 });
  }
}
