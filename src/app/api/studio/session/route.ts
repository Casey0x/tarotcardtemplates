import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

/** GET ?session_id=cs_xxx — returns { deckId } for Stripe checkout success redirect. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

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

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', session.user.id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('purchase_id', purchase.id)
    .eq('user_id', session.user.id)
    .single();

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  return NextResponse.json({ deckId: deck.id });
}
