'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const PREMIUM_PRICE = 1000; // Rp 1.000

export async function purchaseProtection(resiNumber: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Check if already insured
    const { data: existing } = await (supabase as any)
        .from('package_insurances')
        .select('id')
        .eq('resi_number', resiNumber)
        .single();

    if (existing) return { error: 'Paket ini sudah diasuransikan.' };

    // 2. Check Wallet Balance (Mock implementation if wallet table varies)
    // We assume a rpc function 'deduct_balance' exists or we do it manually.
    // Ideally: const { error: paymentError } = await supabase.rpc('deduct_wallet_balance', { amount: PREMIUM_PRICE, user_id: user.id });

    // For safety in this script, we'll assume "Pay Later" or direct insert success if no wallet logic is strictly enforced yet.
    // TODO: Integrate strictly with your walletActions.ts

    // 3. Insert Insurance
    const { error } = await (supabase as any).from('package_insurances').insert({
        resi_number: resiNumber,
        user_id: user.id,
        premium_paid: PREMIUM_PRICE,
        coverage_amount: 500000,
        status: 'active'
    });

    if (error) {
        console.error('Insurance purchase error:', error);
        return { error: 'Gagal memproses asuransi.' };
    }

    revalidatePath('/cek-resi');
    return { success: true };
}

export async function claimInsurance(insuranceId: string, evidenceUrl: string) {
    const supabase = await createClient();
    const { error } = await (supabase as any)
        .from('package_insurances')
        .update({ status: 'claimed', claim_evidence: evidenceUrl })
        .eq('id', insuranceId);

    if (error) return { error: 'Gagal mengajukan klaim' };
    revalidatePath('/dashboard/insurance');
    return { success: true };
}
