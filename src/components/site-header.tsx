'use client';

import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { href: '/templates', label: 'Templates' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/custom-printing', label: 'Custom printing' },
  { href: '/blog', label: 'Blog' },
  { href: '/account', label: 'My account' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-charcoal/10 bg-cream">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-wide">
          TarotCardTemplates.com
        </Link>

        {/* Desktop nav — visible lg and above */}
        <nav className="hidden lg:flex">
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

        {/* Hamburger button — visible below lg */}
        <button
          className="lg:hidden flex items-center justify-center p-2 text-2xl leading-none"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-cream px-6 pt-5">
          {/* Top bar inside overlay: logo + close button */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              TarotCardTemplates.com
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
          <nav className="mt-10">
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
        </div>
      )}
    </header>
  );
}
