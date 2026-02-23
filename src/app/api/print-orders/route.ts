import { NextResponse } from 'next/server';
import { listPrintOrders } from '@/lib/orders';

export async function GET() {
  return NextResponse.json({ orders: listPrintOrders() });
}
