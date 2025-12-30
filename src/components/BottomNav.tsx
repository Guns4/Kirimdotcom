'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Mobile Bottom Navigation
 * Features: Thumb-zone friendly, FAB, 44px touch targets
 * Only visible on screens < 768px
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: 'Riwayat',
    href: '/history',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  // FAB placeholder - will be rendered separately
  {
    label: 'Scan',
    href: '/scan',
    icon: null,
  },
  {
    label: 'Notif',
    href: '/notifications',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    label: 'Akun',
    href: '/account',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

// FAB Component
function FloatingActionButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
      style={{ minWidth: '56px', minHeight: '56px' }} // Minimum touch target
      aria-label="Scan atau Cek Resi"
    >
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  );
}

// Bottom Nav Item
function BottomNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  // Skip FAB placeholder
  if (!item.icon) return null;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[48px]',
        'transition-colors duration-200',
        isActive ? 'text-primary-500' : 'text-surface-500'
      )}
      style={{ minWidth: '64px', minHeight: '48px' }} // Touch target
    >
      <div className="relative">
        {isActive && item.activeIcon ? item.activeIcon : item.icon}
        {/* Notification badge example */}
        {item.label === 'Notif' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-500 rounded-full" />
        )}
      </div>
      <span
        className={cn(
          'text-[10px] mt-1 font-medium',
          isActive && 'font-semibold'
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

// Main Component
export function BottomNav() {
  const pathname = usePathname();
  const [showQuickAction, setShowQuickAction] = useState(false);

  // Get items except FAB placeholder
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(3);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 safe-bottom">
        {/* Background with glass effect */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-surface-100" />

        {/* Navigation Content */}
        <div className="relative flex items-center justify-around h-16 px-2">
          {/* Left Items */}
          {leftItems.map((item) => (
            <BottomNavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}

          {/* FAB in center */}
          <div className="relative w-16">
            <FloatingActionButton onClick={() => setShowQuickAction(true)} />
          </div>

          {/* Right Items */}
          {rightItems.map((item) => (
            <BottomNavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* Quick Action Modal */}
      {showQuickAction && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowQuickAction(false)}
          />

          {/* Action Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up safe-bottom">
            <div className="w-12 h-1 bg-surface-200 rounded-full mx-auto mb-6" />

            <h3 className="text-lg font-bold text-surface-900 text-center mb-6">
              Apa yang ingin Anda lakukan?
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/"
                onClick={() => setShowQuickAction(false)}
                className="flex flex-col items-center gap-3 p-6 bg-primary-50 rounded-2xl hover:bg-primary-100 transition-colors"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-primary-700">Cek Resi</span>
              </Link>

              <Link
                href="/scan"
                onClick={() => setShowQuickAction(false)}
                className="flex flex-col items-center gap-3 p-6 bg-secondary-50 rounded-2xl hover:bg-secondary-100 transition-colors"
              >
                <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-secondary-700">
                  Scan QR
                </span>
              </Link>

              <Link
                href="/cek-ongkir"
                onClick={() => setShowQuickAction(false)}
                className="flex flex-col items-center gap-3 p-6 bg-success-50 rounded-2xl hover:bg-success-100 transition-colors"
              >
                <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="font-semibold text-success-700">
                  Cek Ongkir
                </span>
              </Link>

              <Link
                href="/dashboard/booking"
                onClick={() => setShowQuickAction(false)}
                className="flex flex-col items-center gap-3 p-6 bg-warning-50 rounded-2xl hover:bg-warning-100 transition-colors"
              >
                <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎫</span>
                </div>
                <span className="font-semibold text-warning-700">
                  Booking Resi
                </span>
              </Link>
            </div>

            <button
              onClick={() => setShowQuickAction(false)}
              className="w-full mt-6 py-3 text-surface-500 font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Spacer for content above bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

export default BottomNav;
