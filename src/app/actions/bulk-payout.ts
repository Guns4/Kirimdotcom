'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BulkPayoutItem {
    id: string;
    user_id: string;
    amount: number;
    bank_name: string;
    account_number: string;
}

export async function getPendingWithdrawals() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('withdrawals')
        .select('*, user:user_id(email)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) throw error;

    return data || [];
}

export async function processBulkPayout(withdrawalIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Fetch withdrawal details
    const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .in('id', withdrawalIds)
        .eq('status', 'PENDING');

    if (!withdrawals || withdrawals.length === 0) {
        throw new Error('No valid withdrawals found');
    }

    const results = {
        success: 0,
        failed: 0,
        total: withdrawals.length,
        totalAmount: 0
    };

    // 2. Process each withdrawal
    for (const withdrawal of withdrawals) {
        try {
            // Update status to PROCESSING
            await supabase
                .from('withdrawals')
                .update({
                    status: 'PROCESSING',
                    processed_by: user.id,
                    processed_at: new Date().toISOString()
                })
                .eq('id', withdrawal.id);

            // Simulate payment processing (in real app, call payment gateway)
            // await callPaymentGateway(withdrawal);

            // Mark as COMPLETED
            await supabase
                .from('withdrawals')
                .update({
                    status: 'COMPLETED',
                    completed_at: new Date().toISOString()
                })
                .eq('id', withdrawal.id);

            // Deduct from ledger
            await supabase.from('ledger_entries').insert({
                user_id: withdrawal.user_id,
                amount: -withdrawal.amount,
                type: 'WITHDRAWAL',
                description: `Pencairan Dana #${withdrawal.id.slice(0, 8)}`
            });

            results.success++;
            results.totalAmount += Number(withdrawal.amount);

        } catch (error) {
            console.error(`Failed to process withdrawal ${withdrawal.id}:`, error);

            // Mark as FAILED
            await supabase
                .from('withdrawals')
                .update({
                    status: 'FAILED',
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                })
                .eq('id', withdrawal.id);

            results.failed++;
        }
    }

    revalidatePath('/admin/finance/withdrawals');
    return results;
}
