import { createClient } from '@/utils/supabase/server';

const COMMISSION_AMOUNT = 25; // Rp 25 per transaction

export interface NetworkStats {
    totalDownlines: number;
    totalCommission: number;
    recentCommissions: any[];
    referralLink: string;
}

export async function getNetworkStats(userId: string): Promise<NetworkStats> {
    const supabase = await createClient();

    // 1. Get User Relation Count (Downlines)
    const { count: totalDownlines, error: countError } = await (supabase as any)
        .from('user_relations')
        .select('*', { count: 'exact', head: true })
        .eq('upline_id', userId);

    if (countError) console.error('Error fetching downlines:', countError);

    // 2. Get Total Commission from Wallet Transactions
    const { data: transactions, error: txError } = await (supabase as any)
        .from('wallet_transactions')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('type', 'COMMISSION_REWARD');

    const totalCommission = transactions?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0;
    const recentCommissions = transactions?.slice(0, 10) || [];

    // 3. Generate Referral Link (using ID for simplicity)
    // In a real app, might want to generate a short code
    const referralLink = `https://cekkirim.com/register?ref=${userId}`;

    return {
        totalDownlines: totalDownlines || 0,
        totalCommission,
        recentCommissions,
        referralLink
    };
}

// Called when a new user registers with a referral code
export async function registerDownline(downlineId: string, referralCode: string) {
    const supabase = await createClient();

    // Assume referralCode is the upline's User ID for this implementation
    const uplineId = referralCode;

    // Prevent self-referral
    if (downlineId === uplineId) return { error: 'Self referral not allowed' };

    // Create relation
    const { error } = await (supabase as any)
        .from('user_relations')
        .insert({
            upline_id: uplineId,
            downline_id: downlineId
        });

    return { error };
}

// Called when a transaction completes (e.g., in rates/route.ts or webhook)
export async function processTransactionCommission(transactingUserId: string) {
    const supabase = await createClient();

    // 1. Find Upline
    const { data: relation } = await (supabase as any)
        .from('user_relations')
        .select('upline_id')
        .eq('downline_id', transactingUserId)
        .single();

    if (!relation || !relation.upline_id) return; // No upline, no commission

    // 2. Credit Upline (Phase 1761 Rule: Rp 25)
    const { error } = await (supabase as any)
        .rpc('add_commission', {
            p_upline_id: relation.upline_id,
            p_downline_id: transactingUserId, // Just for logging/ref if needed
            p_amount: COMMISSION_AMOUNT,
            p_description: `Commission from downline transaction`
        });

    if (error) console.error('Commission Error:', error);
}
