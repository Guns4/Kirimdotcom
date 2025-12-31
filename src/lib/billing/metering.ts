import { createClient } from '@/utils/supabase/server';

const PRICING = {
    STARTER: 100, // Rp 100 per hit
    PRO: 50,      // Rp 50 per hit
    ENTERPRISE: 20 // Rp 20 per hit
};

export async function checkAndDeductBalance(userId: string) {
    const supabase = createClient();

    // 1. Get User Balance & Plan
    const { data: user, error } = await supabase
        .from('users')
        .select('balance, billing_plan, api_usage_today')
        .eq('id', userId)
        .single();

    if (error || !user) throw new Error('User not found');

    const costPerHit = PRICING[user.billing_plan as keyof typeof PRICING] || 100;
    const newBalance = user.balance - costPerHit;

    // 2. Scenario C: Blocking (< -10,000)
    if (newBalance < -10000) {
        return { allowed: false, error: 'Kuota Habis, Topup Segera' };
    }

    // 3. Deduct Balance (Atomic RPC preferred in production)
    // For now using simple update
    await supabase.from('users').update({
        balance: newBalance,
        api_usage_today: user.api_usage_today + 1
    }).eq('id', userId);

    // 4. Scenario B: Grace Period Warning
    if (newBalance < 0) {
        return { allowed: true, warning: 'Saldo negatif. Harap topup.' }; // Grace period
    }

    // Scenario A: Normal
    return { allowed: true };
}
