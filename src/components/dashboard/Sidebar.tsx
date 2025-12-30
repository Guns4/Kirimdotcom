'use client';

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandProvider, useBrand } from '@/providers/BrandProvider';

/**
 * Dashboard Sidebar - Collapsible Navigation
 * Features: Collapse to icons, active states, groups
 */

// Context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({ isCollapsed: false, setIsCollapsed: () => { } });

export function useSidebar() {
  return useContext(SidebarContext);
}

// Menu Items
const menuItems = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Analitik', href: '/dashboard/analytics', icon: '📈' },
    ],
  },
  {
    group: 'Pengiriman',
    items: [
      { label: 'Semua Order', href: '/dashboard/orders', icon: '📦' },
      { label: 'Resi Aktif', href: '/dashboard/tracking', icon: '🚚' },
      { label: 'Booking Resi', href: '/dashboard/booking', icon: '🎫' },
    ],
  },
  {
    group: 'Keuangan',
    items: [
      { label: 'Wallet', href: '/dashboard/wallet', icon: '💳' },
      { label: 'Transaksi', href: '/dashboard/transactions', icon: '💰' },
      { label: 'Invoice', href: '/dashboard/invoices', icon: '📄' },
    ],
  },
  {
    group: 'Bisnis',
    items: [
      { label: 'Produk', href: '/dashboard/products', icon: '🏷️' },
      { label: 'Supplier', href: '/dashboard/suppliers', icon: '🏪' },
      { label: 'Dropship', href: '/dashboard/dropship', icon: '🤝' },
    ],
  },
  {
    group: 'Pengaturan',
    items: [
      { label: 'Profil', href: '/dashboard/profile', icon: '👤' },
      { label: 'Notifikasi', href: '/dashboard/notifications', icon: '🔔' },
      { label: 'API Keys', href: '/dashboard/api', icon: '🔑' },
    ],
  },
];

// Sidebar Component
export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const brand = useBrand();

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-surface-100 transition-all duration-300 z-40',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              {brand.tenant.logoUrl ? (
                <img
                  src={brand.tenant.logoUrl}
                  alt={brand.tenant.brandName}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: brand.tenant.primaryColor }}
                >
                  <span className="text-white font-bold text-sm">
                    {brand.tenant.brandName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-bold text-surface-900 truncate max-w-[140px]">
                {brand.tenant.brandName}
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 hover:bg-surface-100 rounded-lg transition-colors',
              isCollapsed && 'mx-auto'
            )}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={cn(
                'w-5 h-5 text-surface-500 transition-transform',
                isCollapsed && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {menuItems.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 px-3">
                  {group.group}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                          isActive
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
                          isCollapsed && 'justify-center px-2'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!brand.tenant.hideFooter && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-surface-100 bg-white">
            <Link
              href="/dashboard/help"
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-surface-500 hover:text-surface-700 rounded-lg hover:bg-surface-100 transition-colors',
                isCollapsed && 'justify-center'
              )}
            >
              <span className="text-lg">❓</span>
              {!isCollapsed && <span className="text-sm">Bantuan</span>}
            </Link>
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

// Dashboard Layout Wrapper
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <BrandProvider>
      <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
        <div className="min-h-screen bg-surface-50">
          <DashboardSidebar />
          <main
            className={cn(
              'transition-all duration-300',
              isCollapsed ? 'ml-20' : 'ml-64'
            )}
          >
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-surface-100 flex items-center justify-between px-6 sticky top-0 z-30">
              <h1 className="text-lg font-semibold text-surface-800">
                Dashboard
              </h1>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-surface-100 rounded-lg text-surface-500">
                  🔔
                </button>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  U
                </div>
              </div>
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarContext.Provider>
    </BrandProvider>
  );
}

export default DashboardSidebar;
