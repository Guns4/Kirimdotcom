// Defines personas and their default widgets

export type Persona = 'SELLER' | 'BUYER' | 'AGENT' | 'NEW_USER';

export interface WidgetConfig {
    id: string;
    componentName: string; // Map to actual React component
    title: string;
    size: 'full' | 'half';
}

const LAYOUTS: Record<Persona, WidgetConfig[]> = {
    SELLER: [
        { id: 'sales_chart', componentName: 'SalesChart', title: 'Sales Performance', size: 'full' },
        { id: 'pending_orders', componentName: 'OrderList', title: 'Pending Orders', size: 'half' },
        { id: 'supply_store', componentName: 'SupplyPromo', title: 'Buy Packing Materials', size: 'half' }
    ],
    BUYER: [
        { id: 'active_tracking', componentName: 'TrackingWidget', title: 'Track Packages', size: 'full' },
        { id: 'promo_banner', componentName: 'PromoCarousel', title: 'Deals for You', size: 'full' },
        { id: 'game', componentName: 'DailySpin', title: 'Win Prizes', size: 'half' }
    ],
    AGENT: [
        { id: 'commission', componentName: 'CommissionChart', title: 'Your Earnings', size: 'full' },
        { id: 'top_routes', componentName: 'RouteStats', title: 'Popular Routes', size: 'half' },
        { id: 'agent_news', componentName: 'NewsFeed', title: 'Agent Updates', size: 'half' }
    ],
    NEW_USER: [
        { id: 'onboarding', componentName: 'WelcomeGuide', title: 'Get Started', size: 'full' },
        { id: 'first_promo', componentName: 'PromoCarousel', title: 'First Order Discount', size: 'full' }
    ]
};

export function getLayoutForPersona(persona: Persona): WidgetConfig[] {
    return LAYOUTS[persona] || LAYOUTS.NEW_USER;
}
