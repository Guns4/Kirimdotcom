'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { NAV_GROUPS, NAV_LINKS, type NavItem, type NavGroup } from '@/config/navigation';
import { cn } from '@/lib/utils';

/**
 * Mobile Navigation Drawer
 * Sheet with Accordion grouping
 */

// ============================================
// Mobile Navbar
// ============================================

interface NavbarMobileProps {
    isLoggedIn?: boolean;
    onLoginClick?: () => void;
    onRegisterClick?: () => void;
}

export function NavbarMobile({ isLoggedIn, onLoginClick, onRegisterClick }: NavbarMobileProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Close on route change
    const pathname = usePathname();
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-100 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-surface-700" />
            </button>

            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 lg:hidden',
                    'transform transition-transform duration-300 ease-out',
                    'flex flex-col shadow-2xl',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-100">
                    <Link href="/" className="text-xl font-bold text-primary-600">
                        CekKirim
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-surface-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-4">
                    {/* Navigation Groups */}
                    {NAV_GROUPS.map((group) => (
                        <MobileAccordion key={group.label} group={group} />
                    ))}

                    {/* Direct Links */}
                    <div className="px-4 mt-4">
                        <div className="border-t border-surface-100 pt-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 hover:bg-surface-50 font-medium"
                                >
                                    {link.icon && <link.icon className="w-5 h-5 text-surface-400" />}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-surface-100 space-y-3 bg-surface-50">
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={onLoginClick}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                <LogIn className="w-5 h-5" />
                                Masuk
                            </button>
                            <button
                                onClick={onRegisterClick}
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-surface-200 hover:border-primary-300 text-surface-700 font-semibold rounded-xl transition-colors"
                            >
                                <UserPlus className="w-5 h-5" />
                                Daftar Gratis
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ============================================
// Mobile Accordion
// ============================================

interface MobileAccordionProps {
    group: NavGroup;
}

function MobileAccordion({ group }: MobileAccordionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="px-4 mb-2">
            {/* Accordion Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    'flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold transition-colors',
                    isExpanded
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-700 hover:bg-surface-50'
                )}
            >
                <span>{group.label}</span>
                <ChevronDown
                    className={cn(
                        'w-5 h-5 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                    )}
                />
            </button>

            {/* Accordion Content */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="mt-1 space-y-1 pl-2">
                    {group.items.map((item) => (
                        <MobileMenuItem key={item.href} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Mobile Menu Item
// ============================================

interface MobileMenuItemProps {
    item: NavItem;
}

function MobileMenuItem({ item }: MobileMenuItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors',
                isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
            )}
        >
            {/* Large Icon */}
            <div
                className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-surface-100 text-surface-500'
                )}
            >
                <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent-500 text-white rounded-full">
                            NEW
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-sm text-surface-400 truncate">{item.description}</p>
                )}
            </div>
        </Link>
    );
}

// ============================================
// Bottom Tab Bar (Optional)
// ============================================

import { MOBILE_NAV } from '@/config/navigation';

export function MobileBottomNav() {
    const pathname = usePathname();

    // Hide on certain pages
    const hiddenPaths = ['/auth', '/checkout'];
    const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p));
    if (shouldHide) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 z-40 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-around py-2">
                {MOBILE_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-1 rounded-lg min-w-[60px] transition-colors',
                                isActive ? 'text-primary-600' : 'text-surface-400'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default NavbarMobile;
