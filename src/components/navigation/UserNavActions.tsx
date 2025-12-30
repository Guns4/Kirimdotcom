'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Wallet,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * User Navigation Actions
 * Handles guest and authenticated user states
 */

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  balance?: number;
}

interface UserNavActionsProps {
  user?: UserData | null;
  loading?: boolean;
  notificationCount?: number;
  onLogout?: () => void;
}

export function UserNavActions({
  user,
  loading = false,
  notificationCount = 0,
  onLogout,
}: UserNavActionsProps) {
  // Loading state
  if (loading) {
    return <UserNavSkeleton />;
  }

  // Guest state
  if (!user) {
    return <GuestActions />;
  }

  // Authenticated state
  return (
    <AuthenticatedActions
      user={user}
      notificationCount={notificationCount}
      onLogout={onLogout}
    />
  );
}

// ============================================
// Guest Actions
// ============================================

function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
      >
        Masuk
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
      >
        Daftar Gratis
      </Link>
    </div>
  );
}

// ============================================
// Authenticated Actions
// ============================================

interface AuthenticatedActionsProps {
  user: UserData;
  notificationCount: number;
  onLogout?: () => void;
}

function AuthenticatedActions({
  user,
  notificationCount,
  onLogout,
}: AuthenticatedActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Balance Chip */}
      <Link
        href="/dashboard/wallet"
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors"
      >
        <Wallet className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-semibold text-surface-700">
          Rp {(user.balance || 0).toLocaleString('id-ID')}
        </span>
      </Link>

      {/* Notification Bell */}
      <Link
        href="/dashboard/notifications"
        className="relative p-2 rounded-xl hover:bg-surface-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-surface-600" />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Link>

      {/* Avatar Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 transition-colors"
        >
          <Avatar src={user.avatar} name={user.name} />
          <ChevronDown
            className={cn(
              'w-4 h-4 text-surface-400 transition-transform hidden sm:block',
              isDropdownOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-200 py-2 z-50',
            'transition-all duration-200 ease-out origin-top-right',
            isDropdownOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-surface-100">
            <p className="font-semibold text-surface-800 truncate">
              {user.name}
            </p>
            <p className="text-sm text-surface-500 truncate">{user.email}</p>
          </div>

          {/* Mobile: Wallet (hidden on desktop) */}
          <div className="sm:hidden px-2 py-2 border-b border-surface-100">
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-50"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Wallet className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-semibold text-surface-700">Saldo</p>
                <p className="text-xs text-surface-500">
                  Rp {(user.balance || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="px-2 py-2">
            <DropdownItem
              href="/dashboard"
              icon={User}
              label="Dashboard"
              onClick={() => setIsDropdownOpen(false)}
            />
            <DropdownItem
              href="/dashboard/wallet"
              icon={CreditCard}
              label="Wallet & Topup"
              onClick={() => setIsDropdownOpen(false)}
            />
            <DropdownItem
              href="/dashboard/settings"
              icon={Settings}
              label="Pengaturan"
              onClick={() => setIsDropdownOpen(false)}
            />
            <DropdownItem
              href="/help"
              icon={HelpCircle}
              label="Bantuan"
              onClick={() => setIsDropdownOpen(false)}
            />
          </div>

          {/* Logout */}
          <div className="px-2 pt-2 border-t border-surface-100">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onLogout?.();
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-error-600 hover:bg-error-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Avatar Component
// ============================================

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColor = React.useMemo(() => {
    const hash = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 70%, 50%)`;
  }, [name]);

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-semibold',
          sizeClasses[size]
        )}
        style={{ backgroundColor: bgColor }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', sizeClasses[size])}
      onError={() => setError(true)}
    />
  );
}

// ============================================
// Dropdown Item
// ============================================

interface DropdownItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function DropdownItem({ href, icon: Icon, label, onClick }: DropdownItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-surface-700 hover:bg-surface-50 rounded-xl transition-colors"
    >
      <Icon className="w-5 h-5 text-surface-400" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function UserNavSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      {/* Wallet skeleton */}
      <div className="hidden sm:block w-24 h-8 bg-surface-200 rounded-full" />
      {/* Bell skeleton */}
      <div className="w-9 h-9 bg-surface-200 rounded-xl" />
      {/* Avatar skeleton */}
      <div className="w-9 h-9 bg-surface-200 rounded-full" />
    </div>
  );
}

export default UserNavActions;
