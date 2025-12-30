'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

/**
 * AutoBreadcrumbs Component
 * Automatically generates breadcrumbs based on current route
 */

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  settings: 'Pengaturan',
  profile: 'Profil',
  admin: 'Admin',
  'cek-ongkir': 'Cek Ongkir',
  'cek-resi': 'Cek Resi',
  tracking: 'Lacak Paket',
  history: 'Riwayat',
  billing: 'Tagihan',
  inventory: 'Inventori',
  blacklists: 'Blacklist',
};

export default function AutoBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center text-sm text-muted-foreground',
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label =
          routeLabels[segment] ||
          segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={path}
                className="hover:text-primary transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
