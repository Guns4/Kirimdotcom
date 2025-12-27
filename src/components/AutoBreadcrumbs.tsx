'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Auto Breadcrumbs Component
 * Automatically generates breadcrumbs from URL path
 */

// Path segment labels (Indonesian)
const PATH_LABELS: Record<string, string> = {
    // Main
    dashboard: 'Dashboard',
    orders: 'Pesanan',
    wallet: 'Wallet',
    invoices: 'Invoice',
    inventory: 'Produk',
    customers: 'Pelanggan',
    settings: 'Pengaturan',
    profile: 'Profil',
    notifications: 'Notifikasi',
    history: 'Riwayat',

    // Tools
    tools: 'Tools',
    'cek-ongkir': 'Cek Ongkir',
    'cek-resi': 'Cek Resi',
    'cetak-label': 'Cetak Label',
    blacklist: 'Blacklist',
    'bulk-tracking': 'Bulk Tracking',
    'kalkulator-marketplace': 'Kalkulator',
    'generator-caption': 'Generator Caption',
    'magic-qr': 'Magic QR',
    'wa-rotator': 'WA Rotator',

    // Business
    ppob: 'PPOB',
    marketplace: 'Marketplace',
    booking: 'Booking',

    // Community
    forum: 'Forum',
    rewards: 'Rewards',

    // Auth
    login: 'Masuk',
    register: 'Daftar',
    'forgot-password': 'Lupa Password',

    // Actions
    new: 'Buat Baru',
    edit: 'Edit',
    detail: 'Detail',

    // Admin
    admin: 'Admin',
    users: 'Users',
    transactions: 'Transaksi',
    ads: 'Iklan',

    // Pages
    about: 'Tentang Kami',
    contact: 'Kontak',
    help: 'Bantuan',
    privacy: 'Privasi',
    terms: 'Syarat',
    pricing: 'Harga',
    docs: 'Dokumentasi',
};

interface AutoBreadcrumbsProps {
    className?: string;
    variant?: 'default' | 'sticky';
    showHome?: boolean;
    customLabels?: Record<string, string>;
    excludeSegments?: string[];
}

export function AutoBreadcrumbs({
    className,
    variant = 'default',
    showHome = true,
    customLabels = {},
    excludeSegments = [],
}: AutoBreadcrumbsProps) {
    const pathname = usePathname();

    // Parse path segments
    const segments = pathname
        .split('/')
        .filter(Boolean)
        .filter((seg) => !excludeSegments.includes(seg));

    // Don't show breadcrumbs on home page
    if (segments.length === 0) return null;

    // Generate breadcrumb items
    const items = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;

        // Get label (custom > path labels > formatted segment)
        const label =
            customLabels[segment] ||
            PATH_LABELS[segment] ||
            formatSegment(segment);

        return { segment, href, label, isLast };
    });

    return (
        <nav
            className={cn(
                'py-3',
                variant === 'sticky' && 'sticky top-16 bg-white/80 backdrop-blur-sm z-30 border-b border-surface-100',
                className
            )}
            aria-label="Breadcrumb"
        >
            <div className="container mx-auto px-4">
                <ol className="flex items-center gap-1.5 text-sm flex-wrap">
                    {/* Home */}
                    {showHome && (
                        <li className="flex items-center">
                            <Link
                                href="/"
                                className="text-surface-400 hover:text-primary-600 transition-colors p-1"
                                aria-label="Home"
                            >
                                <Home className="w-4 h-4" />
                            </Link>
                        </li>
                    )}

                    {/* Path segments */}
                    {items.map((item, index) => (
                        <li key={item.href} className="flex items-center gap-1.5">
                            <ChevronRight className="w-4 h-4 text-surface-300 flex-shrink-0" />
                            {item.isLast ? (
                                <span className="text-surface-700 font-medium truncate max-w-[200px]">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-surface-500 hover:text-primary-600 transition-colors truncate max-w-[150px]"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
}

/**
 * Format segment to readable label
 */
function formatSegment(segment: string): string {
    // Handle IDs (UUIDs, etc)
    if (/^[0-9a-f-]{20,}$/i.test(segment)) {
        return 'Detail';
    }

    // Handle numeric IDs
    if (/^\d+$/.test(segment)) {
        return '#' + segment;
    }

    // Convert kebab-case to Title Case
    return segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Structured data for SEO
 */
export function BreadcrumbsJsonLd() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const items = [
        { name: 'Home', url: 'https://cekkirim.com' },
        ...segments.map((segment, index) => ({
            name: PATH_LABELS[segment] || formatSegment(segment),
            url: 'https://cekkirim.com/' + segments.slice(0, index + 1).join('/'),
        })),
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default AutoBreadcrumbs;
