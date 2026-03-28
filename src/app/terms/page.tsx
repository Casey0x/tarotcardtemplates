import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for tarotcardtemplates.com: digital templates, AI tools, custom creation, printing, accounts, and purchases.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <header className="space-y-2 border-b border-charcoal/10 pb-6">
        <h1 className="text-4xl font-semibold text-charcoal">Terms of Service</h1>
        <p className="text-sm text-charcoal/70">
          Website:{' '}
          <a href="https://www.tarotcardtemplates.com" className="underline underline-offset-4 hover:text-charcoal">
            tarotcardtemplates.com
          </a>
        </p>
        <p className="text-sm text-charcoal/70">Last updated: 29 March 2026</p>
      </header>

      <div className="space-y-10 text-charcoal/85">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">1. Overview</h2>
          <p>
            Welcome to tarotcardtemplates.com (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
          <p>
            By using this website, you agree to these Terms of Service. If you don&apos;t agree, please don&apos;t use
            the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">2. What We Provide</h2>
          <p>We offer:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Digital tarot templates and design assets</li>
            <li>AI-powered tarot tools and content generation</li>
            <li>Custom card creation tools</li>
            <li>Physical printing services (where applicable)</li>
          </ul>
          <p>We may update or change features at any time.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">3. Accounts</h2>
          <p>When you create an account:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>You must provide accurate information</li>
            <li>You are responsible for your account activity</li>
            <li>You must keep your login secure</li>
          </ul>
          <p>We may suspend or terminate accounts if there is misuse.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal">4. Purchases</h2>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-charcoal">Digital products</h3>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Delivered instantly after purchase</li>
              <li>Non-refundable once accessed</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-charcoal">Physical products</h3>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Prices vary depending on quantity and configuration</li>
              <li>You are responsible for reviewing designs before printing</li>
              <li>Production and shipping times are estimates</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">5. User content</h2>
          <p>When you upload or create content (images, text, designs):</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>You own your content</li>
            <li>You give us permission to use it to operate the platform (rendering, previews, printing)</li>
          </ul>
          <p>You must not upload:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Copyrighted material you don&apos;t own</li>
            <li>Illegal or offensive content</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">6. AI-generated content</h2>
          <p>Our platform may generate tarot readings or creative outputs.</p>
          <p>These are:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>For entertainment and creative use only</li>
            <li>Not professional advice of any kind</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">7. Intellectual property</h2>
          <p>
            All website content (excluding user uploads), including templates, designs, branding, and code, belongs to
            tarotcardtemplates.com and may not be copied, resold, or redistributed without permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">8. Limitation of liability</h2>
          <p>We are not responsible for:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Decisions made using AI-generated content</li>
            <li>Errors in user-submitted designs</li>
            <li>Loss of data or business interruptions</li>
          </ul>
          <p>Use the platform at your own risk.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">9. Refund policy</h2>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Digital products: non-refundable</li>
            <li>Physical products: may be replaced if defective (not for user design errors)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">10. Termination</h2>
          <p>We may suspend or terminate access if:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>These terms are violated</li>
            <li>The platform is misused</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">11. Changes</h2>
          <p>We may update these Terms. Continued use means you accept any updates.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">12. Contact</h2>
          <p>
            Email:{' '}
            <a href="mailto:casey@choiceprint.co.nz" className="underline underline-offset-4 hover:text-charcoal">
              casey@choiceprint.co.nz
            </a>
          </p>
        </section>
      </div>

      <p className="pt-4">
        <Link href="/" className="text-sm underline underline-offset-4">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
