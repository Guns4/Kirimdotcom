'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, AlertCircle } from 'lucide-react';
import { useSystemStatus } from '@/context/SystemStatusContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { status } = useSystemStatus();

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
            {/* System Status Banner */}
            {status !== 'normal' && (
                <div className="bg-yellow-500/90 text-white text-xs py-1 px-4 text-center backdrop-blur-sm animate-fade-in">
                    <div className="container-custom flex items-center justify-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>Tracking API sedang mengalami gangguan intermiten. Gunakan link alternatif jika tracking gagal.</span>
                    </div>
                </div>
            )}
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo + Brand Name */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="CekKirim Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            priority
                        />
                        <span className="text-2xl font-bold gradient-text">
                            CekKirim
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/statistics"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Statistik
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all"
                        >
                            Masuk
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/statistics"
                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Statistik
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

