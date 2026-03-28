import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for tarotcardtemplates.com: what we collect, how we use data, AI processing, cookies, and your rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <header className="space-y-2 border-b border-charcoal/10 pb-6">
        <h1 className="text-4xl font-semibold text-charcoal">Privacy Policy</h1>
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
          <p>At tarotcardtemplates.com, we take your privacy seriously.</p>
          <p>This policy explains what information we collect, how we use it, and what rights you have.</p>
          <p>If you use the site, you&apos;re agreeing to how this works.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal">2. Information we collect</h2>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-charcoal">Information you provide</h3>
            <p>When you use the platform, you may provide:</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Name and email address (account creation)</li>
              <li>Uploaded images, artwork, or designs</li>
              <li>Text inputs (e.g. tarot questions, prompts, card edits)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-charcoal">Automatically collected</h3>
            <p>We may collect:</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Device and browser information</li>
              <li>IP address</li>
              <li>Pages visited and actions taken on the site</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">3. How we use your information</h2>
          <p>We use your information to:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Run and improve the platform</li>
            <li>Generate AI-powered outputs (e.g. tarot readings, designs)</li>
            <li>Process purchases and printing orders</li>
            <li>Save your projects, templates, and readings</li>
            <li>Send essential account-related emails</li>
            <li>Send optional emails (only if you opt in)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">4. AI processing</h2>
          <p>When you enter text or upload content:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>It may be processed by AI systems to generate results</li>
            <li>This processing is required for the platform to function</li>
          </ul>
          <p>We do not sell your personal content to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">5. User content</h2>
          <p>Your uploaded content (images, designs, text):</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Remains yours</li>
            <li>Is only used to operate the service (rendering, previews, printing, storage)</li>
          </ul>
          <p>We do not publicly display your content without your permission.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">6. Cookies</h2>
          <p>We use cookies to:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Keep you logged in</li>
            <li>Improve site performance</li>
            <li>Understand how people use the platform</li>
          </ul>
          <p>You can disable cookies in your browser settings if you prefer.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">7. Third-party services</h2>
          <p>We may use trusted third-party services for:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Payments</li>
            <li>Hosting and storage</li>
            <li>Analytics</li>
          </ul>
          <p>These services may process your data under their own privacy policies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">8. Data storage &amp; security</h2>
          <p>Your data is stored using secure systems and providers.</p>
          <p>We take reasonable steps to protect your information, but no system is completely secure.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">9. Your rights</h2>
          <p>You have the right to:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Access your personal data</li>
            <li>Request corrections</li>
            <li>Request deletion</li>
          </ul>
          <p>
            To do this, contact us at:{' '}
            <a href="mailto:casey@choiceprint.co.nz" className="underline underline-offset-4 hover:text-charcoal">
              casey@choiceprint.co.nz
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">10. Email communication</h2>
          <p>We may send:</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>Account and transaction emails</li>
            <li>Product updates</li>
            <li>Optional follow-up emails (like tarot reflections)</li>
          </ul>
          <p>You can unsubscribe from non-essential emails at any time.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">11. Children&apos;s privacy</h2>
          <p>This platform is not intended for users under 13 years of age.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">12. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time.</p>
          <p>If you continue using the site, you accept those changes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-charcoal">13. Contact</h2>
          <p>For any privacy-related questions:</p>
          <p>
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
