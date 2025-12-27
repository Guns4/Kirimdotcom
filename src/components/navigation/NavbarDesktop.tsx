'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Sparkles } from 'lucide-react';
import { NAV_GROUPS, NAV_LINKS, type NavItem, type NavGroup } from '@/config/navigation';
import { cn } from '@/lib/utils';

/**
 * Mega Menu Navigation (Stripe/Vercel Style)
 */

// ============================================
// Navigation Root
// ============================================

export function NavbarDesktop() {
    return (
        <nav className="hidden lg:flex items-center gap-1">
            {/* Dropdown Groups */}
            {NAV_GROUPS.map((group) => (
                <NavDropdown key={group.label} group={group} />
            ))}

            {/* Direct Links */}
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}

// ============================================
// Dropdown Menu
// ============================================

interface NavDropdownProps {
    group: NavGroup;
}

function NavDropdown({ group }: NavDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger */}
            <button
                className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                    isOpen
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                )}
            >
                {group.label}
                <ChevronDown
                    className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown Panel */}
            <div
                className={cn(
                    'absolute top-full left-0 pt-2 z-50',
                    'transition-all duration-200 ease-out',
                    isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                )}
            >
                <MegaMenuPanel group={group} />
            </div>
        </div>
    );
}

// ============================================
// Mega Menu Panel
// ============================================

interface MegaMenuPanelProps {
    group: NavGroup;
}

function MegaMenuPanel({ group }: MegaMenuPanelProps) {
    const hasPromo = group.label === 'Bisnis'; // Show promo for Bisnis

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden min-w-[500px]">
            <div className={cn('grid', hasPromo ? 'grid-cols-[1fr,200px]' : 'grid-cols-1')}>
                {/* Menu Items */}
                <div className="p-4">
                    <p className="px-3 py-1.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                        {group.label}
                    </p>
                    <div className="grid gap-1 mt-2">
                        {group.items.map((item) => (
                            <MegaMenuItem key={item.href} item={item} />
                        ))}
                    </div>
                </div>

                {/* Promo Banner (Optional) */}
                {hasPromo && (
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 flex flex-col justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
                            <p className="text-white font-bold text-sm">Diskon Pulsa</p>
                            <p className="text-white/80 text-xs mt-1">Hingga 5% hari ini!</p>
                            <Link
                                href="/ppob"
                                className="mt-3 block bg-white text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                Beli Sekarang
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Menu Item
// ============================================

interface MegaMenuItemProps {
    item: NavItem;
}

function MegaMenuItem({ item }: MegaMenuItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={cn(
                'group flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-150',
                isActive
                    ? 'bg-primary-50'
                    : 'hover:bg-surface-50'
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-surface-100 text-surface-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                )}
            >
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'font-medium transition-colors',
                            isActive ? 'text-primary-700' : 'text-surface-800 group-hover:text-primary-700'
                        )}
                    >
                        {item.label}
                    </span>
                    {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent-500 text-white rounded-full uppercase">
                            New
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-sm text-surface-500 mt-0.5 line-clamp-1">
                        {item.description}
                    </p>
                )}
            </div>

            {/* Arrow on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">
                →
            </div>
        </Link>
    );
}

// ============================================
// Full Navbar with Logo
// ============================================

interface FullNavbarProps {
    logo?: React.ReactNode;
    actions?: React.ReactNode;
}

export function FullNavbar({ logo, actions }: FullNavbarProps) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-surface-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        {logo || (
                            <Link href="/" className="text-xl font-bold text-primary-600">
                                CekKirim
                            </Link>
                        )}
                        <NavbarDesktop />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {actions}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default NavbarDesktop;
