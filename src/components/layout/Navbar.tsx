'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'glass-navbar'
                    : 'bg-transparent'
                }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Placeholder */}
                    <Link href="/" className="flex items-center space-x-2">
                        <LogoPlaceholder />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/tentang"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Tentang
                        </Link>
                        <Link
                            href="/kontak"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Kontak
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/tentang"
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Tentang
                            </Link>
                            <Link
                                href="/kontak"
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Kontak
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

function LogoPlaceholder({ logoUrl }: { logoUrl?: string }) {
    // Prepared for future: if logoUrl is provided from database, render Image
    // For now, display text "CekKirim" with gradient

    if (logoUrl) {
        // Future implementation:
        // return <Image src={logoUrl} alt="CekKirim" width={120} height={32} />
        return null;
    }

    return (
        <span className="text-2xl font-bold gradient-text">
            CekKirim
        </span>
    );
}
