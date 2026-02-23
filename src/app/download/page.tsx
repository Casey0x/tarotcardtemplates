import Link from 'next/link';

export default function DownloadPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-semibold">Download delivery</h1>
      <p className="text-charcoal/80">Order reference: {searchParams.orderId ?? 'not provided'}</p>
      <div className="space-y-3 border border-charcoal/10 bg-white p-6">
        <p className="font-medium">Your files are ready</p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-charcoal/80">
          <li>
            <Link href="#" className="underline underline-offset-4">
              Download card fronts package (stub)
            </Link>
          </li>
          <li>
            <Link href="#" className="underline underline-offset-4">
              Download print setup guide (stub)
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
