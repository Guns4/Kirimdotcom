import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PageHeader Component
 * Standard page header with title, description, and breadcrumbs
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  variant?: 'default' | 'gradient' | 'minimal';
  align?: 'left' | 'center';
  actions?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  variant = 'gradient',
  align = 'left',
  actions,
  badge,
  icon,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variant === 'gradient' &&
          'bg-gradient-to-br from-primary-50 via-white to-accent-50',
        variant === 'default' && 'bg-surface-50 border-b border-surface-200',
        variant === 'minimal' && 'bg-white'
      )}
    >
      {/* Decorative elements for gradient variant */}
      {variant === 'gradient' && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </>
      )}

      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-surface-400 hover:text-primary-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                </Link>
              </li>
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-surface-300" />
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-surface-500 hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-surface-700 font-medium">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div
          className={cn(
            'flex flex-col lg:flex-row lg:items-center gap-4',
            align === 'center' && 'lg:justify-center text-center'
          )}
        >
          <div
            className={cn(
              'flex-1',
              align === 'center' && 'flex flex-col items-center'
            )}
          >
            {/* Title with optional icon and badge */}
            <div className="flex items-center gap-3 flex-wrap">
              {icon && (
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <h1 className="text-2xl lg:text-4xl font-bold text-surface-900">
                {title}
              </h1>
              {badge && (
                <span className="px-2.5 py-1 text-xs font-bold bg-accent-500 text-white rounded-full uppercase">
                  {badge}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p
                className={cn(
                  'mt-3 text-surface-500 max-w-2xl text-base lg:text-lg leading-relaxed',
                  align === 'center' && 'mx-auto'
                )}
              >
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Preset Page Headers
// ============================================

export const PAGE_HEADERS = {
  blacklist: {
    title: 'Cek Blacklist',
    description:
      'Cegah kerugian COD dengan database gotong royong dari ribuan seller.',
    breadcrumbs: [{ label: 'Cek Blacklist' }],
  },
  ppob: {
    title: 'PPOB & Pulsa',
    description:
      'Jual pulsa, paket data, token PLN, dan PPOB lainnya dengan harga kompetitif.',
    breadcrumbs: [{ label: 'PPOB' }],
    badge: 'Promo',
  },
  forum: {
    title: 'Forum Seller',
    description:
      'Diskusi, berbagi tips, dan networking dengan sesama seller se-Indonesia.',
    breadcrumbs: [
      { label: 'Komunitas', href: '/community' },
      { label: 'Forum' },
    ],
  },
  tracking: {
    title: 'Cek Resi',
    description: 'Lacak paket dari semua ekspedisi dalam satu tempat.',
    breadcrumbs: [{ label: 'Cek Resi' }],
  },
  ongkir: {
    title: 'Cek Ongkir',
    description:
      'Bandingkan tarif pengiriman dari berbagai kurir secara real-time.',
    breadcrumbs: [{ label: 'Cek Ongkir' }],
  },
  marketplace: {
    title: 'Supplier Directory',
    description:
      'Temukan supplier terpercaya untuk bisnis dropship dan reseller Anda.',
    breadcrumbs: [{ label: 'Marketplace' }],
  },
  rewards: {
    title: 'Rewards & Leaderboard',
    description:
      'Kumpulkan poin dari setiap transaksi dan tukar dengan hadiah menarik.',
    breadcrumbs: [{ label: 'Rewards' }],
  },
  help: {
    title: 'Pusat Bantuan',
    description:
      'Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami.',
    breadcrumbs: [{ label: 'Bantuan' }],
  },
  cetakLabel: {
    title: 'Cetak Label',
    description:
      'Cetak label pengiriman untuk thermal printer dengan format standar ekspedisi.',
    breadcrumbs: [{ label: 'Cetak Label' }],
  },
};

export default PageHeader;
