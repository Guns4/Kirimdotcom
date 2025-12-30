'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/config/admin-permissions';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AdminRole } from '@/lib/admin-rbac';
import {
    LayoutDashboard, Users, Ticket, DollarSign, CreditCard,
    Package, Truck, FileText, Settings, AlertTriangle
} from 'lucide-react';

const ICONS: Record<string, any> = {
    LayoutDashboard, Users, Ticket, DollarSign, CreditCard,
    Package, Truck, FileText, Settings, AlertTriangle
};

export function RoleBasedSidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState<AdminRole | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('admin_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(data?.role as AdminRole || null);
            }
        }
        fetchRole();
    }, []);

    if (!role) return <div className="p-4 text-xs text-gray-400">Loading Menu...</div>;

    const filteredItems = SIDEBAR_ITEMS.filter(item => item.roles.includes(role));

    return (
        <nav className="space-y-1 px-2">
            {filteredItems.map((item) => {
                const Icon = ICONS[item.icon];
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`} aria-hidden="true" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
