#!/bin/bash

# =============================================================================
# Security: Admin Role Middleware Setup (Task 94)
# =============================================================================

echo "Initializing Role-Based Access Control..."
echo "================================================="

# 1. Config Mappings
echo "1. Creating Config: src/config/admin-permissions.ts"
mkdir -p src/config

cat <<EOF > src/config/admin-permissions.ts
import { AdminRole } from '@/lib/admin-rbac';

export const PROTECTED_ROUTES: Record<string, AdminRole[]> = {
    '/admin/finance': ['SUPER_ADMIN', 'FINANCE'],
    '/admin/withdrawals': ['SUPER_ADMIN', 'FINANCE'],
    '/admin/tickets': ['SUPER_ADMIN', 'SUPPORT'],
    '/admin/users': ['SUPER_ADMIN', 'SUPPORT'],
    '/admin/blog': ['SUPER_ADMIN', 'CONTENT'],
    '/admin/ads': ['SUPER_ADMIN', 'CONTENT'],
    '/admin/orders': ['SUPER_ADMIN', 'LOGISTICS'],
    '/admin/supply': ['SUPER_ADMIN', 'LOGISTICS'],
    '/admin/inventory': ['SUPER_ADMIN', 'LOGISTICS'],
    '/admin/settings': ['SUPER_ADMIN'],
};

export const SIDEBAR_ITEMS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', roles: ['SUPER_ADMIN', 'FINANCE', 'SUPPORT', 'CONTENT', 'LOGISTICS'] },
    { label: 'Users', href: '/admin/users', icon: 'Users', roles: ['SUPER_ADMIN', 'SUPPORT'] },
    { label: 'Tickets', href: '/admin/tickets', icon: 'Ticket', roles: ['SUPER_ADMIN', 'SUPPORT'] },
    { label: 'Finance', href: '/admin/finance', icon: 'DollarSign', roles: ['SUPER_ADMIN', 'FINANCE'] },
    { label: 'Withdraw', href: '/admin/withdrawals', icon: 'CreditCard', roles: ['SUPER_ADMIN', 'FINANCE'] },
    { label: 'Orders', href: '/admin/orders', icon: 'Package', roles: ['SUPER_ADMIN', 'LOGISTICS'] },
    { label: 'Supply', href: '/admin/supply', icon: 'Truck', roles: ['SUPER_ADMIN', 'LOGISTICS'] },
    { label: 'Content', href: '/admin/blog', icon: 'FileText', roles: ['SUPER_ADMIN', 'CONTENT'] },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings', roles: ['SUPER_ADMIN'] },
];
EOF

# 2. Middleware Logic
echo "2. Updating Middleware: src/middleware.ts"
# Note: In a real project we'd carefully merge. Here we present the logic to be used.

cat <<EOF > src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PROTECTED_ROUTES } from '@/config/admin-permissions';
import { AdminRole } from '@/lib/admin-rbac';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const url = request.nextUrl.pathname;

    // 1. Auth Guard for Admin
    if (url.startsWith('/admin') && !user) {
         return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. Role Guard for Admin sub-routes
    if (url.startsWith('/admin') && user) {
        // Fetch Admin Role
        // Optimization: Use a quick RPC or stored procedure, or rely on metadata if synced.
        // For security, we query the DB table directly here.
        const { data: profile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        const userRole = (profile?.role || 'SUPPORT') as AdminRole; // Default fallback to restricted role

        // Check Permissions
        // We find the definition that matches the start of the current path
        const matchingRoute = Object.keys(PROTECTED_ROUTES).find(route => url.startsWith(route));
        
        if (matchingRoute) {
            const allowedRoles = PROTECTED_ROUTES[matchingRoute];
            if (!allowedRoles.includes(userRole)) {
                // Access Denied
                return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
EOF

# 3. Sidebar Component (Role Aware)
echo "3. Creating UI: src/components/admin/RoleBasedSidebar.tsx"
mkdir -p src/components/admin

cat <<EOF > src/components/admin/RoleBasedSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/config/admin-permissions';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AdminRole } from '@/lib/admin-rbac';
import { 
    LayoutDashboard, Users, Ticket, DollarSign, CreditCard, 
    Package, Truck, FileText, Settings 
} from 'lucide-react';

const ICONS: Record<string, any> = {
    LayoutDashboard, Users, Ticket, DollarSign, CreditCard, 
    Package, Truck, FileText, Settings
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
                        className={\`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors \${
                            isActive 
                                ? 'bg-gray-100 text-gray-900' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }\`}
                    >
                        <Icon className={\`mr-3 h-5 w-5 flex-shrink-0 \${
                            isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                        }\`} aria-hidden="true" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
EOF

# 4. Unauthorized Page
echo "4. Creating Page: src/app/admin/unauthorized/page.tsx"
mkdir -p src/app/admin/unauthorized

cat <<EOF > src/app/admin/unauthorized/page.tsx
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500 max-w-md mb-8">
                You do not have permission to view this page. Please contact your Super Admin if you believe this is an error.
            </p>
            <Link 
                href="/admin/dashboard" 
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Role Middleware Setup Complete!"
echo "1. 'src/middleware.ts' now protects routes based on Role."
echo "2. Use '<RoleBasedSidebar />' in your Admin Layout."
