'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Breadcrumbs Component
 * Navigation trail showing path: Home > Dashboard > History
 */

// Path label mappings
const pathLabels: Record<string, string> = {
  '': 'Home',
  dashboard: 'Dashboard',
  history: 'Riwayat',
  orders: 'Pesanan',
  wallet: 'Wallet',
  settings: 'Pengaturan',
  profile: 'Profil',
  booking: 'Booking',
  tracking: 'Tracking',
  invoices: 'Invoice',
  products: 'Produk',
  suppliers: 'Supplier',
  customers: 'Pelanggan',
  inventory: 'Inventori',
  expenses: 'Pengeluaran',
  admin: 'Admin',
  developer: 'Developer',
  'cek-resi': 'Cek Resi',
  'cek-ongkir': 'Cek Ongkir',
  tools: 'Tools',
  shop: 'Toko',
  blog: 'Blog',
  help: 'Bantuan',
  new: 'Baru',
  edit: 'Edit',
};

interface BreadcrumbsProps {
  className?: string;
  homeLabel?: string;
  showHome?: boolean;
}

export function Breadcrumbs({
  className,
  homeLabel = 'Home',
  showHome = true,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Don't show on home page
  if (segments.length === 0) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label =
      pathLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  // Add home
  if (showHome) {
    breadcrumbs.unshift({ path: '/', label: homeLabel, isLast: false });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-surface-300 mx-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {crumb.isLast ? (
              <span className="text-surface-600 font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-surface-400 hover:text-primary-500 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Structured Data for SEO
export function BreadcrumbsJsonLd() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cekkirim.com';

  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    ...segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: pathLabels[segment] || segment,
      item: `${baseUrl}/${segments.slice(0, index + 1).join('/')}`,
    })),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default Breadcrumbs;
