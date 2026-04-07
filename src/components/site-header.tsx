'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CurrencySwitcher } from '@/components/currency-switcher';

const navItems = [
  { href: '/templates', label: 'Templates' },
  { href: '/borders', label: 'Borders' },
  { href: '/studio-beta', label: 'Studio' },
  { href: '/card-meanings', label: 'Card Meanings' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/custom-printing', label: 'Custom printing' },
  { href: '/blog', label: 'Blog' },
  { href: '/account', label: 'My account' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-charcoal/10 bg-cream">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-5">
        {/* Logo */}
        <Link href="/" className="logo-link flex items-center shrink-0" aria-label="Tarot Card Templates home">
          <img
            src="/images/branding/tarot-card-templates-logo.png"
            alt="Tarot Card Templates"
            className="site-logo"
          />
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-5 lg:flex">
          {/* Desktop nav — visible lg and above */}
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
          <CurrencySwitcher />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CurrencySwitcher />
          {/* Hamburger button — visible below lg */}
          <button
            className="flex items-center justify-center p-2 text-2xl leading-none"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex min-h-0 flex-col bg-cream px-6 pt-5">
          {/* Top bar inside overlay: logo + close button */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="logo-link flex items-center shrink-0"
              onClick={() => setMenuOpen(false)}
              aria-label="Tarot Card Templates home"
            >
              <img
                src="/images/branding/tarot-card-templates-logo.png"
                alt="Tarot Card Templates"
                className="site-logo"
              />
            </Link>
            <button
              className="flex items-center justify-center p-2 text-2xl leading-none"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Stacked nav links */}
          <nav className="mt-10 flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-6 text-lg">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-mutedGold transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto border-t border-charcoal/10 py-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-charcoal/55">Currency</p>
            <CurrencySwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
