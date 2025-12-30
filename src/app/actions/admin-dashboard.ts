'use server';

import { createClient } from '@/utils/supabase/server';

export async function getAdminDashboardMetrics() {
    const supabase = await createClient();

    // 1. Calculate Profit Today (WALLET_SYSTEM_REVENUE)
    // Assuming ledger_entries has types like 'FEE', 'COMMISSION', 'INSURANCE_PREMIUM' that count as revenue
    // Or we have a specific 'WALLET_SYSTEM_REVENUE' user ID or type.
    // For now, let's sum positive amounts in 'ledger_entries' for the system account or specific types globally if simplified.
    // Simpler: Sum all 'SERVICE_FEE' and 'INSURANCE_PREMIUM' for today.

    const today = new Date().toISOString().split('T')[0];

    // Using a raw query or multiple selects. Let's do simple multiple selects for demo reliability.
    const { data: fees } = await supabase
        .from('ledger_entries')
        .select('amount')
        .in('type', ['SERVICE_FEE', 'INSURANCE_PREMIUM', 'AD_SPEND']) // Revenue sources
        .gte('created_at', today);

    // In our ledger, these are usually deducted from user (negative), so revenue is positive. 
    // Wait, ledger_entries usually tracks USER balance. So if user PAYS fee, it's negative.
    // Revenue = ABS(Sum of Negative Fees).

    const profitToday = fees?.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0) || 0;

    // 2. Action Required (Pending Withdrawals + Open Tickets)
    // We check if tables exist first, wrapping in try/catch or just simple selects assumes they exist

    let pendingWithdrawals = 0;
    // Check withdrawals table if exists (Task 46)
    const { count: withdrawalCount, error: wError } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');
    if (!wError) pendingWithdrawals = withdrawalCount || 0;

    let openComplaints = 0;
    // Mock tickets check standard table structure
    // const { count: ticketCount } = ... 

    // 3. Critical Checks (Vendor Balance)
    // Mock check for now
    const vendorBalanceLow = false;

    return {
        profitToday,
        pendingWithdrawals,
        openComplaints,
        vendorBalanceLow
    };
}
