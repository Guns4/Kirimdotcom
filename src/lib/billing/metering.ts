import { createClient } from '@/utils/supabase/server';

export const PRICING_TIERS = {
    FREE: { quota: 100, rate: 0 },
    PRO: { quota: 10000, rate: 50 }, // Rp 50 per request
    ENTERPRISE: { quota: -1, rate: 25 } // Rp 25 per request, unlimited
};

export async function trackApiUsage(userId: string, endpoint: string, plan: string = 'FREE', clientIp?: string): Promise<{ allowed: boolean; cost: number; error?: string }> {
    const supabase = await createClient();

    const tier = PRICING_TIERS[plan as keyof typeof PRICING_TIERS] || PRICING_TIERS.FREE;
    let cost = tier.rate;

    // 1. Check Free Quota Logic (Simplified)
    // Real implementation needs to fetch user's current usage count for today/month
    // For now, let's assume if plan is FREE, cost is 0 until limit triggers

    if (plan === 'FREE') {
        const { data: user } = await supabase.from('users').select('free_quota_used').eq('id', userId).single(); // Assuming users view exists or direct auth.users access via RPC

        if (user && user.free_quota_used >= tier.quota) {
            return { allowed: false, cost: 0, error: 'Free quota exceeded. Upgrade to PRO.' };
        }
        cost = 0;
    }

    // 2. Prepare Log Entry
    // We insert log first with 'pending' status or similar, or just insert after deduction.
    // Let's optimize: Check balance -> Deduct -> Log result.

    // 3. Billing Guard: Check Balance if Cost > 0
    if (cost > 0) {
        // Use RPC for atomic deduction
        // Generate a provisional ID for reference
        const refId = crypto.randomUUID();

        const { data: success, error: rpcError } = await supabase.rpc('deduct_balance', {
            p_user_id: userId,
            p_amount: cost,
            p_description: `API Usage: ${endpoint}`,
            p_ref_id: refId
        });

        if (rpcError || !success) {
            // Log failed attempt
            await supabase.from('metering_logs').insert({
                user_id: userId,
                endpoint,
                cost: 0,
                status: 'denied_insufficient_balance',
                ip_address: clientIp
            });
            return { allowed: false, cost: 0, error: 'Insufficient balance' };
        }
    }

    // 4. Log Success (and increment free quota if needed)
    await supabase.from('metering_logs').insert({
        user_id: userId,
        endpoint,
        cost,
        status: 'success',
        ip_address: clientIp
    });

    if (plan === 'FREE') {
        // Increment free quota
        await supabase.rpc('increment_free_quota', { p_user_id: userId }); // Assuming RPC exists or use update
    }

    return { allowed: true, cost };
}
