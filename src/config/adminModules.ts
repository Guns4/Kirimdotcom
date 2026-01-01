import {
    LayoutDashboard, Users, Wallet, ShoppingBag,
    ShieldAlert, Banknote, Settings, LucideIcon
} from 'lucide-react';

export interface AdminModule {
    id: string;
    label: string;
    icon: LucideIcon;
    description: string;
}

export const ADMIN_MODULES: AdminModule[] = [
    {
        id: 'OVERVIEW',
        label: 'Command Center',
        icon: LayoutDashboard,
        description: 'Real-time analytics and system overview dashboard.'
    },
    {
        id: 'MONETIZATION',
        label: 'Monetization & Ads',
        icon: Banknote,
        description: 'Hybrid ad management (Google + Internal campaigns).'
    },
    {
        id: 'FINANCE',
        label: 'Financial Vault',
        icon: Wallet,
        description: 'Withdrawal approvals and financial monitoring (Division 3).'
    },
    {
        id: 'MARKET',
        label: 'Marketplace Ops',
        icon: ShoppingBag,
        description: 'Physical stock management and SMM sync (Division 2).'
    },
    {
        id: 'USERS',
        label: 'User Surveillance',
        icon: Users,
        description: 'User management, ban control, and PIN reset tools.'
    },
    {
        id: 'SECURITY',
        label: 'Security Radar',
        icon: ShieldAlert,
        description: 'Live threat monitoring and security event logs.'
    },
    {
        id: 'SETTINGS',
        label: 'System Config',
        icon: Settings,
        description: 'AdSense ratio control and global configuration.'
    },
];
