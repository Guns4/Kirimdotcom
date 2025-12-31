import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/admin/wallet/stats
// Get financial statistics for admin dashboard
// ==========================================

export async function GET(req: Request) {
    try {
        // Security check
        const secret = req.headers.get('x-admin-secret');
        if (secret !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ==========================================
        // 1. Pending Withdrawals Count & Amount
        // ==========================================
        const { data: pendingWithdraws } = await supabase
            .from('wallet_withdrawals')
            .select('amount')
            .eq('status', 'PENDING');

        const pendingWdCount = pendingWithdraws?.length || 0;
        const pendingWdAmount = pendingWithdraws?.reduce((sum, wd) => sum + parseFloat(wd.amount.toString()), 0) || 0;

        // ==========================================
        // 2. Total User Balance (Liability)
        // ==========================================
        const { data: users } = await supabase
            .from('users')
            .select('wallet_balance');

        const totalUserBalance = users?.reduce((sum, user) => sum + (user.wallet_balance || 0), 0) || 0;

        // ==========================================
        // 3. Today's Topup Revenue
        // ==========================================
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: todayTopups } = await supabase
            .from('wallet_topups')
            .select('amount')
            .eq('status', 'PAID')
            .gte('created_at', today.toISOString());

        const todayTopupAmount = todayTopups?.reduce((sum, topup) => sum + parseFloat(topup.amount.toString()), 0) || 0;
        const todayTopupCount = todayTopups?.length || 0;

        // ==========================================
        // 4. This Month's Topup Revenue
        // ==========================================
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { data: monthTopups } = await supabase
            .from('wallet_topups')
            .select('amount')
            .eq('status', 'PAID')
            .gte('created_at', monthStart.toISOString());

        const monthTopupAmount = monthTopups?.reduce((sum, topup) => sum + parseFloat(topup.amount.toString()), 0) || 0;

        // ==========================================
        // 5. Approved Withdrawals Today
        // ==========================================
        const { data: todayApprovedWd } = await supabase
            .from('wallet_withdrawals')
            .select('amount')
            .eq('status', 'APPROVED')
            .gte('updated_at', today.toISOString());

        const todayApprovedWdAmount = todayApprovedWd?.reduce((sum, wd) => sum + parseFloat(wd.amount.toString()), 0) || 0;

        // ==========================================
        // 6. Total Users with Balance
        // ==========================================
        const { count: usersWithBalance } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gt('wallet_balance', 0);

        return NextResponse.json({
            success: true,
            stats: {
                pending_withdrawals: {
                    count: pendingWdCount,
                    total_amount: pendingWdAmount,
                },
                total_user_balance: totalUserBalance,
                users_with_balance: usersWithBalance || 0,
                today: {
                    topup_count: todayTopupCount,
                    topup_amount: todayTopupAmount,
                    approved_withdrawals: todayApprovedWdAmount,
                    net_inflow: todayTopupAmount - todayApprovedWdAmount,
                },
                this_month: {
                    topup_amount: monthTopupAmount,
                },
            },
        });
    } catch (error: any) {
        console.error('[Admin] Stats error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
