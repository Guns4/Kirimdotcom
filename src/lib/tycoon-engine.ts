// Logistics Tycoon Game Engine
// Level progression, XP calculation, and unlockables

export interface TycoonProfile {
    id: string;
    user_id: string;
    current_level: number;
    current_xp: number;
    total_xp: number;
    total_shipments: number;
    total_spent: number;
    total_savings: number;
    unlocked_skins: string[];
    active_skin: string;
    admin_fee_discount: number;
}

export interface Unlockable {
    id: string;
    unlock_type: 'SKIN' | 'DISCOUNT' | 'BADGE';
    unlock_id: string;
    name: string;
    description: string;
    required_level: number;
    benefit_value?: number;
    image_url?: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// Level Configuration
export const LEVEL_CONFIG = {
    1: { name: 'Garasi Rumah', emoji: '🏠', xpRequired: 0, image: 'garage_home' },
    2: { name: 'Garasi Upgrade', emoji: '🏠', xpRequired: 100, image: 'garage_upgraded' },
    3: { name: 'Toko Kecil', emoji: '🏪', xpRequired: 300, image: 'small_shop' },
    4: { name: 'Toko Berkembang', emoji: '🏪', xpRequired: 600, image: 'growing_shop' },
    5: { name: 'Gudang Sedang', emoji: '🏭', xpRequired: 1000, image: 'medium_warehouse' },
    6: { name: 'Gudang Berkembang', emoji: '🏭', xpRequired: 1500, image: 'growing_warehouse' },
    7: { name: 'Gudang Besar', emoji: '🏢', xpRequired: 2200, image: 'large_warehouse' },
    8: { name: 'Gudang Premium', emoji: '🏢', xpRequired: 3000, image: 'premium_warehouse' },
    9: { name: 'Gudang Sultan', emoji: '🏗️', xpRequired: 4000, image: 'sultan_warehouse' },
    10: { name: 'Gudang Raksasa', emoji: '🏗️', xpRequired: 5500, image: 'mega_warehouse' },
} as const;

export const MAX_LEVEL = 10;

// XP Sources
export const XP_REWARDS = {
    SHIPMENT: 10,           // Per shipment
    OPTIMIZATION: 50,       // Using route optimizer
    REFERRAL: 200,          // Successful referral
    DAILY_LOGIN: 5,         // Daily login bonus
    FIRST_SHIPMENT: 100,    // First shipment bonus
    BULK_LABEL: 30,         // Using bulk labels
} as const;

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
    for (let level = MAX_LEVEL; level >= 1; level--) {
        if (totalXP >= LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG].xpRequired) {
            return level;
        }
    }
    return 1;
}

// Get XP progress to next level
export function getXPProgress(totalXP: number): { current: number; required: number; percentage: number } {
    const currentLevel = calculateLevel(totalXP);

    if (currentLevel >= MAX_LEVEL) {
        return { current: totalXP, required: totalXP, percentage: 100 };
    }

    const currentLevelXP = LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].xpRequired;
    const nextLevelXP = LEVEL_CONFIG[(currentLevel + 1) as keyof typeof LEVEL_CONFIG].xpRequired;

    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const percentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return {
        current: xpInCurrentLevel,
        required: xpNeededForNextLevel,
        percentage: Math.min(percentage, 100)
    };
}

// Get level info
export function getLevelInfo(level: number) {
    return LEVEL_CONFIG[Math.min(Math.max(level, 1), MAX_LEVEL) as keyof typeof LEVEL_CONFIG];
}

// Check if item is unlocked
export function isUnlocked(requiredLevel: number, currentLevel: number): boolean {
    return currentLevel >= requiredLevel;
}

// Get rarity color
export function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'COMMON': return 'text-gray-600 bg-gray-100';
        case 'RARE': return 'text-blue-600 bg-blue-100';
        case 'EPIC': return 'text-purple-600 bg-purple-100';
        case 'LEGENDARY': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-gray-600 bg-gray-100';
    }
}

// Get warehouse illustration based on level
export function getWarehouseIllustration(level: number): string {
    const levelInfo = getLevelInfo(level);
    // Returns placeholder URL - in production, use actual images
    return `/images/tycoon/${levelInfo.image}.png`;
}

// Calculate admin fee after discount
export function applyAdminDiscount(baseFee: number, discountPercent: number): number {
    return baseFee * (1 - discountPercent / 100);
}

// Get all available unlockables for a level
export function getUnlockablesForLevel(level: number, allUnlockables: Unlockable[]): Unlockable[] {
    return allUnlockables.filter(u => u.required_level === level);
}

// Get newly unlocked items when leveling up
export function getNewUnlocks(oldLevel: number, newLevel: number, allUnlockables: Unlockable[]): Unlockable[] {
    return allUnlockables.filter(u => u.required_level > oldLevel && u.required_level <= newLevel);
}
