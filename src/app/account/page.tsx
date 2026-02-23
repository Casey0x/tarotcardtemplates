import Link from 'next/link';

const sampleOrders = [
  { id: 'ord_tpl_1001', item: 'Linen Classic template', type: 'digital', status: 'delivered' },
  { id: 'ord_prn_1002', item: 'Studio Minimal printed deck', type: 'print', status: 'ordered' }
];

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">My account</h1>
        <p className="mt-3 text-charcoal/80">
          Auth is stubbed for Phase 1. Replace this with your provider in a later phase.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Recent orders</h2>
        <div className="space-y-3">
          {sampleOrders.map((order) => (
            <div key={order.id} className="border border-charcoal/10 bg-white p-4">
              <p className="font-medium">{order.item}</p>
              <p className="text-sm text-charcoal/70">Order: {order.id}</p>
              <p className="text-sm text-charcoal/70">Status: {order.status}</p>
              {order.type === 'digital' && (
                <Link className="mt-2 inline-block text-sm underline underline-offset-4" href="/download?orderId=ord_tpl_1001">
                  Open download
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
