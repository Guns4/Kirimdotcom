// Downline Service
// Referral system logic and commission processing

export interface CommissionStats {
    totalDownlines: number;
    totalCommission: number;
    todayTransactions: number;
    todayCommission: number;
}

export interface DownlineUser {
    id: string;
    userId: string;
    joinDate: string;
    totalTrx: number;
}

const COMMISSION_AMOUNT = 25; // Rp 25 per transaction

// Process Commission
// Called when a transaction completes successfully
export async function processDownlineCommission(
    downlineId: string,
    transactionRef: string
): Promise<{ processed: boolean; uplineId?: string; amount?: number }> {
    // In production:
    // 1. Find upline
    // const { data: relation } = await supabase.from('user_relations').select('uplne_id').eq('downline_id', downlineId).single();

    // Mock lookup
    const mockUplineId = 'upline-123';

    if (!mockUplineId) return { processed: false };

    // 2. Insert Commission Record
    // await supabase.from('commissions').insert({ ... })

    // 3. Add to Upline Wallet
    // await supabase.rpc('add_balance', { user_id: mockUplineId, amount: COMMISSION_AMOUNT, type: 'COMMISSION_REWARD' })

    console.log(`[Commission] Paid Rp ${COMMISSION_AMOUNT} to ${mockUplineId} for trx ${transactionRef}`);

    return {
        processed: true,
        uplineId: mockUplineId,
        amount: COMMISSION_AMOUNT
    };
}

// Get Upline Stats
export async function getUplineStats(uplineId: string): Promise<CommissionStats> {
    // In production: Count queries
    // const { count } = await supabase.from('user_relations').select('*', { count: 'exact' }).eq('uplne_id', uplineId);

    return {
        totalDownlines: 45,
        totalCommission: 157500, // 45 users * mixed trx
        todayTransactions: 120,
        todayCommission: 120 * COMMISSION_AMOUNT // 3000
    };
}

// Register with Referral Code
export async function registerWithReferral(
    userId: string,
    referralCode: string
): Promise<{ success: boolean; error?: string }> {
    // Validate code, create relation
    console.log(`User ${userId} registered with code ${referralCode}`);
    return { success: true };
}
