import { createClient } from '@/utils/supabase/server';

export type UserTier = 'BASIC' | 'RESELLER' | 'VIP';

export const MARKUP_RATES = {
    BASIC: 1000,
    RESELLER: 200,
    VIP: 50
};

export const UPGRADE_COSTS = {
    RESELLER: 100000,
    VIP: 500000
};

export async function getUserTier(userId: string): Promise<UserTier> {
    const supabase = await createClient();
    const { data } = await (supabase as any)
        .from('users')
        .select('tier')
        .eq('id', userId)
        .single();

    return (data?.tier as UserTier) || 'BASIC';
}

export async function getTierMarkup(userId: string): Promise<number> {
    const tier = await getUserTier(userId);
    return MARKUP_RATES[tier] || MARKUP_RATES.BASIC;
}

export async function performUpgrade(targetTier: 'RESELLER' | 'VIP') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const cost = UPGRADE_COSTS[targetTier];

    const { data: result, error } = await (supabase as any)
        .rpc('upgrade_user_tier', {
            p_user_id: user.id,
            p_target_tier: targetTier,
            p_cost: cost
        });

    if (error) {
        return { success: false, message: error.message };
    }

    return result as { success: boolean, message: string };
}
