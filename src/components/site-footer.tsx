import Link from 'next/link';

const footerLinks = [
  { href: '/templates', label: 'Templates' },
  { href: '/borders', label: 'Borders' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/blog', label: 'Blog' },
  { href: '/custom-printing', label: 'Custom Printing' },
  { href: 'mailto:casey@choiceprint.co.nz', label: 'Contact' },
];

export function SiteFooter() {
  return (
    <footer className="celestial-background mt-8 border-t border-charcoal/10 py-10 text-sm text-neutral-600">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-3">
          <p className="text-charcoal/90">
            Designed for modern tarot publishing workflows — templates, borders, and optional printing for
            indie creators.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                {item.href.startsWith('mailto:') ? (
                  <a
                    href={item.href}
                    className="text-charcoal/80 underline-offset-4 hover:text-charcoal hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className="text-charcoal/80 underline-offset-4 hover:text-charcoal hover:underline">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link href="/privacy" className="text-charcoal/80 underline-offset-4 hover:text-charcoal hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-charcoal/80 underline-offset-4 hover:text-charcoal hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-6 text-center text-xs text-neutral-500 md:text-left">
        © 2026 Tarot Card Templates. All rights reserved.
      </p>
    </footer>
  );
}
