/**
 * BUNDLE DISCOUNT ENGINE
 * Phase 306-310: Calculate savings and validate bundle pricing
 */

export interface BundleItem {
    type: string;
    name: string;
    value: number;
    duration_days?: number;
    product_id?: string;
}

export interface BundleProduct {
    id: string;
    bundle_name: string;
    bundle_slug: string;
    description: string;
    original_price: number;
    bundle_price: number;
    discount_percentage: number;
    items: BundleItem[];
    features: string[];
    badge_text?: string;
    is_active: boolean;
}

/**
 * Calculate total savings when buying a bundle
 */
export function calculateBundleSavings(
    originalPrice: number,
    bundlePrice: number
): number {
    return originalPrice - bundlePrice;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
    originalPrice: number,
    bundlePrice: number
): number {
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - bundlePrice) / originalPrice) * 100);
}

/**
 * Validate if bundle price is correctly discounted
 */
export function validateBundleDiscount(
    originalPrice: number,
    bundlePrice: number,
    expectedDiscountPercent: number
): boolean {
    const actualDiscount = calculateDiscountPercentage(originalPrice, bundlePrice);
    return Math.abs(actualDiscount - expectedDiscountPercent) < 1; // Allow 1% tolerance
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calculate individual item contribution to total value
 */
export function getItemValueBreakdown(items: BundleItem[]): {
    totalValue: number;
    breakdown: Array<{ name: string; value: number; percentage: number }>;
} {
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);

    const breakdown = items.map(item => ({
        name: item.name,
        value: item.value,
        percentage: (item.value / totalValue) * 100,
    }));

    return { totalValue, breakdown };
}

/**
 * Check if user qualifies for bundle (can be extended for conditions)
 */
export function isUserEligibleForBundle(
    userStatus: 'new' | 'existing' | 'premium',
    bundleSlug: string
): boolean {
    // For starter kit, everyone is eligible
    if (bundleSlug === 'starter-kit-pemula') {
        return true;
    }

    // Add more complex logic here for other bundles
    return userStatus !== 'premium'; // Premium users might not need starter kit
}
