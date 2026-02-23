import Link from 'next/link';

const navItems = [
  { href: '/templates', label: 'Templates' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/custom-printing', label: 'Custom printing' },
  { href: '/account', label: 'My account' }
];

export function SiteHeader() {
  return (
    <header className="border-b border-charcoal/10 bg-cream">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          TarotCardTemplates.com
        </Link>
        <nav>
          <ul className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-mutedGold transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
