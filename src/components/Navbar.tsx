'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Navbar Component with Logo and Menu
 * Mobile responsive with hamburger menu
 */

const navLinks = [
  { label: 'Lacak', href: '/' },
  { label: 'Cek Ongkir', href: '/cek-ongkir' },
  { label: 'Kurir Lokal', href: '/kurir-lokal' },
  { label: 'Supplier', href: '/suppliers' },
  { label: 'API', href: '/docs' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-surface-100" />

      <nav className="relative container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <span className="text-white font-bold text-lg">CK</span>
            </div>
            <span className="font-bold text-xl text-surface-900">
              Cek<span className="text-primary-500">Kirim</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
            <Button variant="primary" size="sm">
              Daftar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-surface-600 hover:bg-surface-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-surface-100 shadow-soft-lg animate-fade-in-down">
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-surface-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-surface-100 space-y-2">
                <Button variant="outline" className="w-full">
                  Masuk
                </Button>
                <Button variant="primary" className="w-full">
                  Daftar
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
