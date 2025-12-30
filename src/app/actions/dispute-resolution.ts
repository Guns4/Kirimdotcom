'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function resolveDispute(
    disputeId: string,
    winner: 'BUYER' | 'SELLER',
    notes: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Get Dispute Details
    const { data: dispute } = await supabase
        .from('disputes')
        .select('*, buyer:buyer_id(email), seller:seller_id(email)')
        .eq('id', disputeId)
        .single();

    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== 'OPEN' && dispute.status !== 'INVESTIGATING') {
        throw new Error('Dispute already resolved');
    }

    // 2. Update Dispute Status
    const newStatus = winner === 'BUYER' ? 'RESOLVED_BUYER' : 'RESOLVED_SELLER';

    await supabase
        .from('disputes')
        .update({
            status: newStatus,
            resolved_by: user.id,
            resolution_notes: notes,
            resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);

    // 3. Process Refund/Payment
    if (winner === 'BUYER') {
        // Refund money to buyer
        await supabase.from('ledger_entries').insert({
            user_id: dispute.buyer_id,
            amount: dispute.amount,
            type: 'DISPUTE_REFUND',
            description: `Refund dari Sengketa #${disputeId.slice(0, 8)}`
        });
    } else {
        // Release payment to seller
        await supabase.from('ledger_entries').insert({
            user_id: dispute.seller_id,
            amount: dispute.amount,
            type: 'DISPUTE_RELEASE',
            description: `Pembayaran dari Sengketa #${disputeId.slice(0, 8)}`
        });
    }

    revalidatePath('/admin/disputes');
    return { success: true, winner, amount: dispute.amount };
}

export async function getDisputeDetails(disputeId: string) {
    const supabase = await createClient();

    const [dispute, messages, evidence] = await Promise.all([
        supabase
            .from('disputes')
            .select('*, buyer:buyer_id(email), seller:seller_id(email)')
            .eq('id', disputeId)
            .single(),
        supabase
            .from('dispute_messages')
            .select('*, sender:sender_id(email)')
            .eq('dispute_id', disputeId)
            .order('created_at', { ascending: true }),
        supabase
            .from('dispute_evidence')
            .select('*, uploader:uploaded_by(email)')
            .eq('dispute_id', disputeId)
            .order('created_at', { ascending: false })
    ]);

    return {
        dispute: dispute.data,
        messages: messages.data || [],
        evidence: evidence.data || []
    };
}
