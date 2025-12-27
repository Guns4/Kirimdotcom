import {
    Search,
    Truck,
    Printer,
    Shield,
    Smartphone,
    Package,
    MapPin,
    Users,
    Trophy,
    CreditCard,
    Home,
    LayoutDashboard,
    Settings,
    Wallet,
    FileText,
    ShoppingBag,
    Calculator,
    Wand2,
    QrCode,
    MessageSquare,
    Star,
    HelpCircle,
    type LucideIcon,
} from 'lucide-react';

/**
 * Navigation Structure Configuration
 * Grouped menu items for Navbar
 */

// ============================================
// Types
// ============================================

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
    badge?: string;
    isNew?: boolean;
    isExternal?: boolean;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export interface NavLink {
    label: string;
    href: string;
    icon?: LucideIcon;
}

// ============================================
// Main Navigation Groups
// ============================================

export const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Tools',
        items: [
            {
                label: 'Cek Resi',
                href: '/',
                icon: Search,
                description: 'Lacak paket dari semua kurir',
            },
            {
                label: 'Cek Ongkir',
                href: '/cek-ongkir',
                icon: Truck,
                description: 'Bandingkan tarif pengiriman',
            },
            {
                label: 'Print Label',
                href: '/cetak-label',
                icon: Printer,
                description: 'Cetak label thermal printer',
            },
            {
                label: 'Cek Blacklist',
                href: '/blacklist',
                icon: Shield,
                description: 'Cek buyer bermasalah',
            },
        ],
    },
    {
        label: 'Bisnis',
        items: [
            {
                label: 'PPOB & Pulsa',
                href: '/ppob',
                icon: Smartphone,
                description: 'Top up pulsa, PLN, BPJS',
            },
            {
                label: 'Supplier Directory',
                href: '/marketplace',
                icon: Package,
                description: 'Cari supplier dropship',
            },
            {
                label: 'Booking Kurir',
                href: '/dashboard/orders/new',
                icon: MapPin,
                description: 'Pesan pickup & antar',
                isNew: true,
            },
        ],
    },
    {
        label: 'Komunitas',
        items: [
            {
                label: 'Forum Seller',
                href: '/forum',
                icon: Users,
                description: 'Diskusi sesama seller',
            },
            {
                label: 'Leaderboard',
                href: '/rewards',
                icon: Trophy,
                description: 'Ranking & rewards',
            },
        ],
    },
];

// Direct links (not dropdowns)
export const NAV_LINKS: NavLink[] = [
    {
        label: 'Harga',
        href: '/pricing',
        icon: CreditCard,
    },
];

// ============================================
// Dashboard Navigation
// ============================================

export const DASHBOARD_NAV: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview bisnis',
    },
    {
        label: 'Pesanan',
        href: '/dashboard/orders',
        icon: ShoppingBag,
        description: 'Kelola pesanan',
    },
    {
        label: 'Wallet',
        href: '/dashboard/wallet',
        icon: Wallet,
        description: 'Saldo & transaksi',
    },
    {
        label: 'Invoice',
        href: '/dashboard/invoices',
        icon: FileText,
        description: 'Buat invoice',
    },
    {
        label: 'Produk',
        href: '/dashboard/inventory',
        icon: Package,
        description: 'Inventory produk',
    },
    {
        label: 'Pelanggan',
        href: '/dashboard/customers',
        icon: Users,
        description: 'Data pelanggan',
    },
    {
        label: 'Pengaturan',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'Akun & preferensi',
    },
];

// ============================================
// Tools Shortcuts (for homepage)
// ============================================

export const TOOLS_SHORTCUTS: NavItem[] = [
    {
        label: 'Kalkulator Marketplace',
        href: '/tools/kalkulator-marketplace',
        icon: Calculator,
        description: 'Hitung profit & fee',
    },
    {
        label: 'Generator Caption',
        href: '/tools/generator-caption',
        icon: Wand2,
        description: 'AI caption produk',
    },
    {
        label: 'Magic QR',
        href: '/tools/magic-qr',
        icon: QrCode,
        description: 'Generate QR code',
    },
    {
        label: 'WA Rotator',
        href: '/tools/wa-rotator',
        icon: MessageSquare,
        description: 'Link multi CS',
    },
];

// ============================================
// Footer Navigation
// ============================================

export const FOOTER_NAV = {
    product: [
        { label: 'Cek Resi', href: '/' },
        { label: 'Cek Ongkir', href: '/cek-ongkir' },
        { label: 'Cetak Label', href: '/cetak-label' },
        { label: 'Bulk Tracking', href: '/bulk-tracking' },
    ],
    resources: [
        { label: 'Blog', href: '/blog' },
        { label: 'FAQ', href: '/help' },
        { label: 'API Docs', href: '/docs' },
        { label: 'Status', href: '/status' },
    ],
    company: [
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Kontak', href: '/contact' },
        { label: 'Karir', href: '/careers' },
    ],
    legal: [
        { label: 'Syarat & Ketentuan', href: '/terms' },
        { label: 'Kebijakan Privasi', href: '/privacy' },
    ],
};

// ============================================
// Mobile Bottom Navigation
// ============================================

export const MOBILE_NAV: NavItem[] = [
    {
        label: 'Beranda',
        href: '/',
        icon: Home,
    },
    {
        label: 'Riwayat',
        href: '/dashboard/history',
        icon: Search,
    },
    {
        label: 'Tools',
        href: '/tools',
        icon: Wand2,
    },
    {
        label: 'Rewards',
        href: '/rewards',
        icon: Star,
    },
    {
        label: 'Akun',
        href: '/dashboard',
        icon: Users,
    },
];

// ============================================
// Admin Navigation
// ============================================

export const ADMIN_NAV: NavItem[] = [
    {
        label: 'Overview',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Users',
        href: '/dashboard/admin/users',
        icon: Users,
    },
    {
        label: 'Transactions',
        href: '/admin/transactions',
        icon: CreditCard,
    },
    {
        label: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        label: 'Ads',
        href: '/admin/ads',
        icon: Star,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export default {
    NAV_GROUPS,
    NAV_LINKS,
    DASHBOARD_NAV,
    TOOLS_SHORTCUTS,
    FOOTER_NAV,
    MOBILE_NAV,
    ADMIN_NAV,
};
