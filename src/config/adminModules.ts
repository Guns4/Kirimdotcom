import {
    LayoutDashboard, Users, Wallet, ShoppingBag,
    ShieldAlert, Banknote, Settings, Globe, FileText, LifeBuoy, Cpu, Sliders, HardDrive, Megaphone, LineChart, Smartphone, Plug, Store, Map, Brain, Truck, Trophy, Rocket, LucideIcon
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
        id: 'AI_INTEL',
        label: 'AI Intelligence',
        icon: Brain,
        description: 'AI cost monitoring, chatbot training, and fraud detection management.'
    },
    {
        id: 'GAME',
        label: 'Gamification & Loyalty',
        icon: Trophy,
        description: 'Game economy: gacha probability control, loyalty tiers, and badge management.'
    },
    {
        id: 'GROWTH',
        label: 'Marketing Intelligence',
        icon: Rocket,
        description: 'RFM segmentation, funnel analysis, A/B testing, and marketing automation.'
    },
    {
        id: 'LOGISTICS',
        label: 'Domestic Ops',
        icon: Truck,
        description: 'Indonesian logistics: COD reconciliation, courier control, and RTS tracking.'
    },
    {
        id: 'O2O',
        label: 'Agent Network',
        icon: Store,
        description: 'O2O agent management, approval queue, and POS monitoring.'
    },
    {
        id: 'IOT',
        label: 'Device & IoT',
        icon: Cpu,
        description: 'IoT device monitoring for printers, lockers, and hardware.'
    },
    {
        id: 'FLEET',
        label: 'Fleet Tracking',
        icon: Map,
        description: 'Real-time GPS tracking of delivery fleet and drivers.'
    },
    {
        id: 'MOBILE',
        label: 'App Command Center',
        icon: Smartphone,
        description: 'Mobile app remote config, version control, and push notifications.'
    },
    {
        id: 'PLUGINS',
        label: 'Plugin Repository',
        icon: Plug,
        description: 'B2B plugin distribution and version management for WordPress/WooCommerce.'
    },
    {
        id: 'CONTROLS',
        label: 'System Controls',
        icon: Sliders,
        description: 'Feature flags and emergency kill switches for instant service control.'
    },
    {
        id: 'COMMS',
        label: 'Broadcast Center',
        icon: Megaphone,
        description: 'Send announcements and alerts to all users via dashboard banners.'
    },
    {
        id: 'INTEL',
        label: 'Profit Intelligence',
        icon: LineChart,
        description: 'Deep profit analytics: Revenue - Costs = Net Profit tracking.'
    },
    {
        id: 'BACKUP',
        label: 'Data Backup',
        icon: HardDrive,
        description: 'Export and backup critical data as CSV files.'
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
