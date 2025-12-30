// Tier Pricing Service
// Wholesale pricing logic for Basic, Reseller, and VIP

export type AccountLevel = 'BASIC' | 'RESELLER' | 'VIP';

export interface UserTier {
    userId: string;
    accountLevel: AccountLevel;
    validUntil?: Date;
}

export const TIER_CONFIG = {
    BASIC: {
        id: 'BASIC',
        name: 'Basic Member',
        markup: 1000,
        color: 'gray',
        benefits: ['Akses fitur dasar', 'Harga standar']
    },
    RESELLER: {
        id: 'RESELLER',
        name: 'Reseller',
        markup: 200,
        color: 'blue',
        price: 100000, // One-time upgrade fee
        benefits: ['Harga lebih murah (Markup Rp 200)', 'Prioritas support', 'Akses fitur Reseller']
    },
    VIP: {
        id: 'VIP',
        name: 'VIP Partner',
        markup: 50,
        color: 'gold',
        price: 500000,
        benefits: ['Harga termurah (Markup Rp 50)', 'Support 24/7', 'Akses semua fitur', 'Bebas biaya admin']
    }
};

// Calculate price based on tier
export function calculateTierPrice(basePrice: number, level: AccountLevel = 'BASIC'): number {
    const markup = TIER_CONFIG[level].markup;
    return basePrice + markup;
}

// Get user tier
export async function getUserTier(userId: string): Promise<UserTier> {
    // In production: Query from Supabase
    // const { data } = await supabase.from('user_tiers').select('*').eq('user_id', userId).single();

    // Mock data
    return {
        userId,
        accountLevel: 'BASIC'
    };
}

// Upgrade account
export async function upgradeAccount(
    userId: string,
    targetLevel: AccountLevel
): Promise<{ success: boolean; error?: string }> {
    // Check if target level is valid upgrade
    if (targetLevel === 'BASIC') return { success: false, error: 'Cannot upgrade to Basic' };

    const config = TIER_CONFIG[targetLevel];

    // In production: 
    // 1. Check user balance
    // 2. Deduct balance
    // 3. Update user_tiers table
    // 4. Record transaction

    console.log(`Upgrading user ${userId} to ${targetLevel} for Rp ${config.price}`);

    return { success: true };
}

// Get savings comparison
export function getSavingsComparison(basePrice: number): { level: string; price: number; savings: number }[] {
    const basicPrice = calculateTierPrice(basePrice, 'BASIC');

    return Object.keys(TIER_CONFIG).map(key => {
        const level = key as AccountLevel;
        const price = calculateTierPrice(basePrice, level);
        return {
            level: TIER_CONFIG[level].name,
            price,
            savings: basicPrice - price
        };
    });
}
