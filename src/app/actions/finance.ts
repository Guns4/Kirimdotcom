'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const MIN_WITHDRAWAL = 10000;

export async function requestWithdrawal(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const amount = Number(formData.get('amount'));
    const bankName = formData.get('bankName') as string;
    const accNum = formData.get('accNum') as string;
    const accHolder = formData.get('accHolder') as string;

    if (amount < MIN_WITHDRAWAL) return { error: 'Minimum penarikan Rp 10.000' };

    // 1. Check Balance & Wallet ID
    const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).single();
    if (!wallet) return { error: 'Dompet tidak ditemukan.' };
    if (Number(wallet.balance) < amount) return { error: 'Saldo tidak mencukupi.' };

    // 2. ATOMIC: Debit Ledger + Create Request
    const tempRef = `REQ-${Date.now()}`;

    // A. Debit First (Lock Funds)
    const { error: debitError } = await supabase.from('ledger_entries').insert({
        wallet_id: wallet.id,
        amount: amount,
        entry_type: 'DEBIT',
        description: `Withdrawal Request to ${bankName}`,
        reference_id: tempRef
    });

    if (debitError) {
        console.error(debitError);
        return { error: 'Gagal memproses saldo.' };
    }

    // B. Create Request Record
    const { error: reqError } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount: amount,
        bank_name: bankName,
        account_number: accNum,
        account_holder: accHolder,
        status: 'PENDING'
    });

    if (reqError) {
        // CRITICAL: ROLLBACK (Credit back)
        await supabase.from('ledger_entries').insert({
            wallet_id: wallet.id,
            amount: amount,
            entry_type: 'CREDIT',
            description: 'System Rollback: Failed Withdraw Request'
        });
        return { error: 'Gagal membuat request penarikan.' };
    }

    revalidatePath('/finance/withdraw');
    return { success: true };
}

export async function processWithdrawal(requestId: string, action: 'APPROVE' | 'REJECT', note?: string) {
    const supabase = await createClient();

    const { data: req } = await supabase.from('withdrawal_requests').select('*').eq('id', requestId).single();
    if (!req || req.status !== 'PENDING') return { error: 'Request invalid' };

    if (action === 'APPROVE') {
        // Just mark as processed. Funds were already debited at request time.
        await supabase.from('withdrawal_requests').update({
            status: 'PROCESSED',
            admin_note: note,
            updated_at: new Date().toISOString()
        }).eq('id', requestId);
    }

    if (action === 'REJECT') {
        const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', req.user_id).single();
        if (wallet) {
            // Refund
            await supabase.from('ledger_entries').insert({
                wallet_id: wallet.id,
                amount: req.amount,
                entry_type: 'CREDIT',
                description: `Refund: Withdrawal Rejected (${note || '-'})`,
                reference_id: req.id
            });
        }

        await supabase.from('withdrawal_requests').update({
            status: 'REJECTED',
            admin_note: note,
            updated_at: new Date().toISOString()
        }).eq('id', requestId);
    }

    revalidatePath('/admin/finance/withdrawals');
    return { success: true };
}
