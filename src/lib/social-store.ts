// Social Store Service
// Service Marketplace - Buy followers like pulsa

import {
    placeProviderOrder,
    checkOrderStatus,
    type SMMProvider,
    type SMMService
} from './smm-integration';

export interface SocialProduct {
    id: string;
    name: string;
    category: 'instagram' | 'tiktok' | 'youtube' | 'google' | 'facebook' | 'twitter';
    type: 'followers' | 'likes' | 'views' | 'comments' | 'reviews' | 'subscribers';
    quantity: number;
    price: number;
    icon: string;
    popular?: boolean;
    description?: string;
}

export interface SocialOrder {
    id: string;
    userId: string;
    productId: string;
    targetUrl: string;
    quantity: number;
    price: number;
    status: 'PENDING' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
    providerOrderId?: string;
    startCount?: number;
    currentCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

// Pre-defined products (like pulsa packages)
export const SOCIAL_PRODUCTS: SocialProduct[] = [
    // Instagram
    { id: 'ig-fol-1k', name: '1.000 IG Followers', category: 'instagram', type: 'followers', quantity: 1000, price: 15000, icon: '📸', popular: true },
    { id: 'ig-fol-5k', name: '5.000 IG Followers', category: 'instagram', type: 'followers', quantity: 5000, price: 65000, icon: '📸' },
    { id: 'ig-like-500', name: '500 IG Likes', category: 'instagram', type: 'likes', quantity: 500, price: 5000, icon: '❤️' },
    { id: 'ig-like-1k', name: '1.000 IG Likes', category: 'instagram', type: 'likes', quantity: 1000, price: 8000, icon: '❤️', popular: true },
    { id: 'ig-view-1k', name: '1.000 IG Views', category: 'instagram', type: 'views', quantity: 1000, price: 3000, icon: '👁️' },

    // TikTok
    { id: 'tt-fol-1k', name: '1.000 TikTok Followers', category: 'tiktok', type: 'followers', quantity: 1000, price: 20000, icon: '🎵', popular: true },
    { id: 'tt-like-500', name: '500 TikTok Likes', category: 'tiktok', type: 'likes', quantity: 500, price: 4000, icon: '💖' },
    { id: 'tt-view-10k', name: '10.000 TikTok Views', category: 'tiktok', type: 'views', quantity: 10000, price: 10000, icon: '▶️' },

    // YouTube
    { id: 'yt-sub-100', name: '100 YouTube Subscribers', category: 'youtube', type: 'subscribers', quantity: 100, price: 25000, icon: '🔴' },
    { id: 'yt-view-1k', name: '1.000 YouTube Views', category: 'youtube', type: 'views', quantity: 1000, price: 8000, icon: '👀' },
    { id: 'yt-like-500', name: '500 YouTube Likes', category: 'youtube', type: 'likes', quantity: 500, price: 12000, icon: '👍' },

    // Google
    { id: 'g-review-5', name: '5 Google Reviews (5⭐)', category: 'google', type: 'reviews', quantity: 5, price: 100000, icon: '⭐', popular: true },
    { id: 'g-review-10', name: '10 Google Reviews (5⭐)', category: 'google', type: 'reviews', quantity: 10, price: 180000, icon: '⭐' },

    // Facebook
    { id: 'fb-like-500', name: '500 FB Page Likes', category: 'facebook', type: 'likes', quantity: 500, price: 15000, icon: '👤' },
    { id: 'fb-fol-1k', name: '1.000 FB Followers', category: 'facebook', type: 'followers', quantity: 1000, price: 20000, icon: '👥' },
];

// Category configs
export const CATEGORIES = {
    instagram: { name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
    tiktok: { name: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-700' },
    youtube: { name: 'YouTube', icon: '▶️', color: 'from-red-500 to-red-600' },
    google: { name: 'Google', icon: '⭐', color: 'from-blue-500 to-green-500' },
    facebook: { name: 'Facebook', icon: '👤', color: 'from-blue-600 to-blue-700' },
    twitter: { name: 'Twitter', icon: '🐦', color: 'from-sky-400 to-sky-500' },
};

// Check user balance
export async function checkBalance(userId: string): Promise<number> {
    // In production: Query from database
    // const { data } = await supabase.from('user_balances').select('balance').eq('user_id', userId);
    return 500000; // Mock balance
}

// Deduct balance
export async function deductBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await checkBalance(userId);
    if (balance < amount) return false;

    // In production: Update database
    // await supabase.from('user_balances').update({ balance: balance - amount }).eq('user_id', userId);
    return true;
}

// Place order
export async function placeOrder(
    userId: string,
    product: SocialProduct,
    targetUrl: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    // Check balance
    const hasBalance = await deductBalance(userId, product.price);
    if (!hasBalance) {
        return { success: false, error: 'Saldo tidak cukup' };
    }

    // Create order in database
    const orderId = `ORD-${Date.now()}`;

    // In production: 
    // 1. Save order to database
    // 2. Call provider API to place order
    // 3. Save provider order ID

    return { success: true, orderId };
}

// Update order status from provider
export async function syncOrderStatus(order: SocialOrder, provider: SMMProvider): Promise<SocialOrder> {
    if (!order.providerOrderId) return order;

    const status = await checkOrderStatus(provider, order.providerOrderId);

    // Map provider status to our status
    let newStatus: SocialOrder['status'] = order.status;
    switch (status.status.toLowerCase()) {
        case 'pending':
            newStatus = 'PENDING';
            break;
        case 'processing':
        case 'in progress':
            newStatus = 'IN_PROGRESS';
            break;
        case 'completed':
            newStatus = 'COMPLETED';
            break;
        case 'canceled':
        case 'cancelled':
            newStatus = 'CANCELLED';
            break;
        case 'partial':
        case 'refunded':
            newStatus = 'REFUNDED';
            break;
    }

    return {
        ...order,
        status: newStatus,
        startCount: status.start_count,
        currentCount: status.start_count ? (status.start_count - (status.remains || 0)) : undefined,
        updatedAt: new Date()
    };
}

// Get status color
export function getStatusColor(status: SocialOrder['status']): string {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
        case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
        case 'PENDING': return 'bg-gray-100 text-gray-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        case 'REFUNDED': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Format price
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}
