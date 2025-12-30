// SMM Panel Integration Service
// Digital Service Arbitrage - Provider sync and price markup

export interface SMMProvider {
    id: string;
    name: string;
    apiUrl: string;
    apiKey: string;
    isActive: boolean;
}

export interface SMMProviderService {
    service: string; // Provider's service ID
    name: string;
    category: string;
    rate: number; // Price per 1000
    min: number;
    max: number;
    desc?: string;
}

export interface SMMService {
    id: string;
    providerId: string;
    providerServiceId: string;
    name: string;
    category: string;
    description?: string;
    providerPrice: number;
    markupPercent: number;
    sellPrice: number;
    minQuantity: number;
    maxQuantity: number;
    isActive: boolean;
}

export interface SMMOrder {
    id: string;
    userId: string;
    serviceId: string;
    providerOrderId?: string;
    targetUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: 'PENDING' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
}

// Default markup percentage
const DEFAULT_MARKUP = 50; // 50% markup

// Calculate sell price with markup
export function calculateSellPrice(providerPrice: number, markupPercent: number = DEFAULT_MARKUP): number {
    return Math.ceil(providerPrice * (1 + markupPercent / 100));
}

// Sync services from provider API
export async function syncProviderServices(provider: SMMProvider): Promise<SMMProviderService[]> {
    try {
        const response = await fetch(provider.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: provider.apiKey,
                action: 'services'
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const services: SMMProviderService[] = await response.json();
        return services;
    } catch (error) {
        console.error('Failed to sync provider services:', error);
        throw error;
    }
}

// Transform provider service to our format with markup
export function transformService(
    providerId: string,
    providerService: SMMProviderService,
    markupPercent: number = DEFAULT_MARKUP
): Omit<SMMService, 'id'> {
    const providerPrice = providerService.rate; // Price per 1000
    const sellPrice = calculateSellPrice(providerPrice, markupPercent);

    return {
        providerId,
        providerServiceId: providerService.service,
        name: providerService.name,
        category: providerService.category,
        description: providerService.desc,
        providerPrice,
        markupPercent,
        sellPrice,
        minQuantity: providerService.min,
        maxQuantity: providerService.max,
        isActive: true
    };
}

// Place order to provider
export async function placeProviderOrder(
    provider: SMMProvider,
    serviceId: string,
    link: string,
    quantity: number
): Promise<{ order: string; error?: string }> {
    try {
        const response = await fetch(provider.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: provider.apiKey,
                action: 'add',
                service: serviceId,
                link,
                quantity
            })
        });

        const result = await response.json();

        if (result.error) {
            return { order: '', error: result.error };
        }

        return { order: result.order };
    } catch (error: any) {
        return { order: '', error: error.message };
    }
}

// Check order status from provider
export async function checkOrderStatus(
    provider: SMMProvider,
    orderId: string
): Promise<{
    status: string;
    start_count?: number;
    remains?: number;
    charge?: number;
}> {
    try {
        const response = await fetch(provider.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: provider.apiKey,
                action: 'status',
                order: orderId
            })
        });

        return await response.json();
    } catch (error) {
        return { status: 'Error' };
    }
}

// Get provider balance
export async function getProviderBalance(provider: SMMProvider): Promise<number> {
    try {
        const response = await fetch(provider.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: provider.apiKey,
                action: 'balance'
            })
        });

        const result = await response.json();
        return parseFloat(result.balance) || 0;
    } catch (error) {
        return 0;
    }
}

// Format price for display
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// Calculate order total
export function calculateOrderTotal(quantity: number, pricePerK: number): number {
    return Math.ceil((quantity / 1000) * pricePerK);
}

// Get profit from an order
export function calculateProfit(quantity: number, sellPrice: number, providerPrice: number): number {
    const sellTotal = calculateOrderTotal(quantity, sellPrice);
    const costTotal = calculateOrderTotal(quantity, providerPrice);
    return sellTotal - costTotal;
}

// Category icons
export const CATEGORY_ICONS: Record<string, string> = {
    'Instagram': '📸',
    'TikTok': '🎵',
    'YouTube': '▶️',
    'Facebook': '👤',
    'Twitter': '🐦',
    'Telegram': '✈️',
    'Spotify': '🎧',
    'SoundCloud': '☁️',
    'LinkedIn': '💼',
    'Default': '📱'
};

export function getCategoryIcon(category: string): string {
    const normalized = Object.keys(CATEGORY_ICONS).find(
        key => category.toLowerCase().includes(key.toLowerCase())
    );
    return CATEGORY_ICONS[normalized || 'Default'];
}
