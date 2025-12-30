'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, X, QrCode, Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating Action Button (FAB)
 * Mobile-only expandable quick actions
 */

interface FABAction {
  id: string;
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

const DEFAULT_ACTIONS: FABAction[] = [
  {
    id: 'scan',
    icon: QrCode,
    label: 'Scan QR',
    href: '/tools/magic-qr',
    color: 'bg-purple-500',
  },
  {
    id: 'track',
    icon: Search,
    label: 'Cek Resi',
    href: '/',
    color: 'bg-primary-500',
  },
  {
    id: 'chat',
    icon: MessageCircle,
    label: 'Chat CS',
    href: 'https://wa.me/6281234567890',
    color: 'bg-green-500',
  },
];

interface FloatingActionButtonProps {
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left';
  hideOnStatic?: boolean;
}

export function FloatingActionButton({
  actions = DEFAULT_ACTIONS,
  position = 'bottom-right',
  hideOnStatic = true,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll behavior
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';

    // Show when scrolling up, hide when scrolling down
    setIsVisible(direction === 'up' || currentScrollY < 100);
    lastScrollY.current = currentScrollY;

    // Reset idle timer
    if (hideOnStatic) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      setIsVisible(true);
      idleTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [hideOnStatic]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [handleScroll]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const positionClass = position === 'bottom-right' ? 'right-4' : 'left-4';

  return (
    <div
      className={cn(
        'fixed bottom-20 z-40 lg:hidden',
        'transition-all duration-300',
        positionClass,
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0 pointer-events-none'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Expanded Actions */}
      <div
        className={cn(
          'absolute bottom-16 right-0 space-y-3',
          'transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-50 opacity-0 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <ActionButton
            key={action.id}
            action={action}
            delay={index * 50}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
          'transition-all duration-300 transform',
          isOpen
            ? 'bg-surface-800 rotate-45'
            : 'bg-primary-500 hover:bg-primary-600 rotate-0'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}

// ============================================
// Action Button
// ============================================

interface ActionButtonProps {
  action: FABAction;
  delay: number;
  isOpen: boolean;
  onClose: () => void;
}

function ActionButton({ action, delay, isOpen, onClose }: ActionButtonProps) {
  const Icon = action.icon;

  const buttonContent = (
    <>
      <span className="text-sm font-medium text-surface-700 bg-white px-3 py-1.5 rounded-full shadow-md">
        {action.label}
      </span>
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg',
          action.color || 'bg-primary-500'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </>
  );

  const className = cn(
    'flex items-center gap-3 justify-end',
    'transition-all duration-300',
    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
  );

  const style = { transitionDelay: isOpen ? `${delay}ms` : '0ms' };

  if (action.href) {
    const isExternal = action.href.startsWith('http');

    if (isExternal) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          style={style}
          onClick={onClose}
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <Link
        href={action.href}
        className={className}
        style={style}
        onClick={onClose}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className={className}
      style={style}
      onClick={() => {
        action.onClick?.();
        onClose();
      }}
    >
      {buttonContent}
    </button>
  );
}

export default FloatingActionButton;
