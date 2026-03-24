import { NextResponse } from 'next/server';

/** Accepts print quote form JSON; extend later for email/CRM. */
export async function POST(request: Request) {
  try {
    await request.json();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
