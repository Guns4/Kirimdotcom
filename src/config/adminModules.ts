import {
    LayoutDashboard, Users, Wallet, ShoppingBag,
    ShieldAlert, Banknote, Settings, Globe, FileText, LifeBuoy, Cpu, LucideIcon
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
        id: 'SUPPORT',
        label: 'Helpdesk Center',
        icon: LifeBuoy,
        description: 'Customer support tickets and helpdesk management.'
    },
    {
        id: 'SYSTEM',
        label: 'System Health & Webhooks',
        icon: Cpu,
        description: 'Webhook monitoring, debugging, and system diagnostics.'
    },
    {
        id: 'SAAS',
        label: 'SaaS B2B Panel',
        icon: Globe,
        description: 'API key management and B2B developer control (Division 4).'
    },
    {
        id: 'CMS',
        label: 'SEO Content Engine',
        icon: FileText,
        description: 'Blog articles and SEO content management system.'
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
