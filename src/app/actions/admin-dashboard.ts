'use server';

import { createClient } from '@/utils/supabase/server';

export async function getAdminDashboardMetrics() {
    const supabase = await createClient();

    // 1. Calculate Profit Today (WALLET_SYSTEM_REVENUE)
    // Assuming ledger_entries has types like 'FEE', 'COMMISSION', 'INSURANCE_PREMIUM' that count as revenue
    // Or we have a specific 'WALLET_SYSTEM_REVENUE' user ID or type.
    // For now, let's sum positive amounts in 'ledger_entries' for the system account or specific types globally if simplified.
    // Simpler: Sum all 'SERVICE_FEE' for today.
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: fees } = await supabase
        .from('ledger_entries')
        .select('amount')
        .eq('type', 'SERVICE_FEE') // adjust type as needed
        .gte('created_at', today);
        
    const profitToday = fees?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // 2. Action Required (Pending Withdrawals + Open Tickets)
    const { count: pendingWithdrawals } = await supabase
        .from('withdrawals') // Assuming this table exists from Task 46
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

    const { count: openComplaints } = await supabase
        .from('tickets') // Assuming tickets table
        .select('*', { count: 'exact', head: true })
        .neq('status', 'CLOSED');

    // 3. Critical Checks (Vendor Balance)
    // Mock check for now, real app would query vendor API or local cache
    const vendorBalanceLow = false; // Set dynamically

    return {
        profitToday,
        pendingWithdrawals: pendingWithdrawals || 0,
        openComplaints: openComplaints || 0,
        vendorBalanceLow
    };
}
