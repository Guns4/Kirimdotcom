'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, History, LayoutGrid, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  // Hide BottomNav on these specific paths if needed (e.g. inside a full-screen tool)
  // const isHidden = pathname.startsWith('/some-tool')

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      isActive: pathname === '/',
    },
    {
      id: 'history',
      label: 'Riwayat',
      icon: History,
      href: '/bulk-tracking', // Using Bulk Tracking as "History" shortcut for now or distinct page
      isActive: pathname === '/bulk-tracking',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: LayoutGrid,
      href: '/tools/cek-cod',
      isActive: pathname.startsWith('/tools'),
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      href: '#footer', // Scroll to footer/menu
      isActive: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      },
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={tab.onClick}
              className="flex flex-col items-center justify-center w-full h-full relative group"
            >
              {/* Active Indicator Background */}
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-x-4 top-1 bottom-1 bg-indigo-500/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div
                className={`relative p-1.5 rounded-xl transition-colors ${
                  active
                    ? 'text-indigo-400'
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-indigo-400' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
