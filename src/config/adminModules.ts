import {
    LayoutDashboard, Users, Wallet, ShoppingBag,
    ShieldAlert, Server, Globe, LucideIcon
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
    // Future Division 4 integration point:
    // { 
    //   id: 'SAAS', 
    //   label: 'SaaS & Plugins', 
    //   icon: Globe,
    //   description: 'B2B SaaS platform and WordPress plugin management (Division 4).' 
    // },
];
