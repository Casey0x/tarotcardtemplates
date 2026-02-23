export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-4xl font-semibold">How it works</h1>
      <ol className="space-y-6">
        <li>
          <h2 className="text-xl font-medium">1. Choose a template</h2>
          <p className="mt-2 text-charcoal/80">Browse the gallery and pick the layout that matches your deck direction.</p>
        </li>
        <li>
          <h2 className="text-xl font-medium">2. Purchase</h2>
          <p className="mt-2 text-charcoal/80">
            Buy a digital template for $18.95, or choose the optional single printed deck at $45.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-medium">3. Receive files or print order confirmation</h2>
          <p className="mt-2 text-charcoal/80">
            Digital orders continue to a download page. Printed deck orders are recorded with status <strong>ordered</strong>.
          </p>
        </li>
      </ol>
    </div>
  );
}
