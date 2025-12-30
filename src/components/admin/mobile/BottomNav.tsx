'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Wallet, Settings } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: '/admin/mobile', label: 'Home', icon: Home },
        { href: '/admin/mobile/tickets', label: 'Tickets', icon: FileText },
        { href: '/admin/mobile/finance', label: 'Finance', icon: Wallet },
        { href: '/admin/mobile/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 pb-safe">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
