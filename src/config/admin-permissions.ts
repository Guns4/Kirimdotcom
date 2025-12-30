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
