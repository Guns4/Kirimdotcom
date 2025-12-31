'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ScanLine, Wallet, User } from 'lucide-react';
import { useNativeUI } from '@/hooks/useNativeUI';
import { motion } from 'framer-motion';

export default function MobileNav() {
    const { isNative } = useNativeUI();
    const pathname = usePathname();

    // ONLY render if we are in Native App mode
    if (!isNative) return null;

    const tabs = [
        { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
        { id: 'track', label: 'Lacak', icon: Package, href: '/bulk-tracking' },
        { id: 'scan', label: 'Scan', icon: ScanLine, href: '/scan', isFab: true }, // Central FAB
        { id: 'wallet', label: 'Dompet', icon: Wallet, href: '/dashboard/wallet' },
        { id: 'profile', label: 'Akun', icon: User, href: '/dashboard/settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] text-gray-800">
            <div className="flex justify-between items-center h-16 px-4">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    if (tab.isFab) {
                        return (
                            <div key={tab.id} className="relative -top-6">
                                <Link href={tab.href}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
                                        <Icon className="w-7 h-7" strokeWidth={2} />
                                    </div>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="flex flex-col items-center justify-center w-12"
                        >
                            <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="native-tab"
                                        className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full left-1/2 -translate-x-1/2"
                                    />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
