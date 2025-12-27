'use client';

import * as React from 'react';
import Link from 'next/link';
import { NavbarDesktop } from './NavbarDesktop';
import { NavbarMobile } from './NavbarMobile';
import { useScrollNavbar } from '@/hooks/useScrollNavbar';
import { cn } from '@/lib/utils';

/**
 * Smart Navbar Wrapper
 * - Backdrop blur glass effect
 * - Scroll detection (transparent → solid)
 * - Hide on scroll down
 */

interface NavbarWrapperProps {
    transparent?: boolean;    // Start transparent (for hero sections)
    hideOnScroll?: boolean;   // Enable hide on scroll down
    isLoggedIn?: boolean;
    children?: React.ReactNode;
}

export function NavbarWrapper({
    transparent = false,
    hideOnScroll = true,
    isLoggedIn,
    children,
}: NavbarWrapperProps) {
    const { isScrolled, isVisible } = useScrollNavbar({
        threshold: 50,
        hideThreshold: 200,
        showDelta: 100,
    });

    // Show solid background when scrolled (or if not transparent mode)
    const showSolid = !transparent || isScrolled;

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50',
                'transition-all duration-300 ease-out',
                // Visibility
                hideOnScroll && !isVisible && '-translate-y-full',
                // Background & Border
                showSolid
                    ? 'bg-white/80 backdrop-blur-xl border-b border-surface-200/50 shadow-sm'
                    : 'bg-transparent',
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div
                            className={cn(
                                'text-xl lg:text-2xl font-bold transition-colors',
                                showSolid ? 'text-primary-600' : 'text-white'
                            )}
                        >
                            CekKirim
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <NavbarDesktop />

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Auth Buttons (Desktop) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        'px-4 py-2 rounded-xl font-medium transition-colors',
                                        showSolid
                                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                    )}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className={cn(
                                            'px-4 py-2 rounded-xl font-medium transition-colors',
                                            showSolid
                                                ? 'text-surface-700 hover:text-surface-900'
                                                : 'text-white/90 hover:text-white'
                                        )}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className={cn(
                                            'px-4 py-2 rounded-xl font-medium transition-colors',
                                            showSolid
                                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                : 'bg-white text-primary-600 hover:bg-primary-50'
                                        )}
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <NavbarMobile isLoggedIn={isLoggedIn} />
                    </div>
                </div>
            </div>

            {/* Optional: Progress bar or children */}
            {children}
        </header>
    );
}

/**
 * Navbar spacer (to prevent content from going under fixed navbar)
 */
export function NavbarSpacer() {
    return <div className="h-16 lg:h-18" />;
}

export default NavbarWrapper;
