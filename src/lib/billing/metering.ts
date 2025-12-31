import { createClient } from '@/utils/supabase/server';

const PRICING = {
    STARTER: 100,
    PRO: 50,
    ENTERPRISE: 20
};

const LOW_BALANCE_THRESHOLD = 5000; // Rp 5,000

export async function checkAndDeductBalance(userId: string, strictMode = false) {
    const supabase = await createClient();

    // 1. Get User Balance, Plan & Free Quota
    const { data: user, error } = await (supabase as any)
        .from('users')
        .select('balance, billing_plan, api_usage_today, free_quota_used')
        .eq('id', userId)
        .single();

    if (error || !user) throw new Error('User not found');

    const FREE_TIER_LIMIT = 100;

    // 2. Check if Free Quota Available (only if not strict mode)
    if (!strictMode && user.free_quota_used < FREE_TIER_LIMIT) {
        await (supabase as any).from('users').update({
            free_quota_used: user.free_quota_used + 1,
            api_usage_today: user.api_usage_today + 1
        }).eq('id', userId);

        if (user.free_quota_used === 90) {
            console.log('📧 Notification: Free quota 90% used for user:', userId);
        }

        return { allowed: true, message: 'Free quota applied', cost: 0 };
    }

    // 3. STRICT BILLING GUARD - Zero tolerance
    if (user.balance <= 0) {
        return {
            allowed: false,
            error: 'Insufficient Balance',
            message: 'Please top up your account to continue using the service.'
        };
    }

    // 4. Deduct Balance
    const costPerHit = PRICING[user.billing_plan as keyof typeof PRICING] || 100;
    const newBalance = user.balance - costPerHit;

    await (supabase as any).from('users').update({
        balance: newBalance,
        api_usage_today: user.api_usage_today + 1
    }).eq('id', userId);

    // 5. Low Balance Alert
    if (newBalance < LOW_BALANCE_THRESHOLD && newBalance >= 0) {
        console.log(`📧 Alert: Low balance for user ${userId}. Balance: Rp ${newBalance}`);
        // TODO: Send email notification
    }

    return { allowed: true, newBalance };
}
