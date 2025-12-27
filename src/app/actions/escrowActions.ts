'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface EscrowResult {
    success: boolean;
    escrowId?: string;
    transactionCode?: string;
    releaseCode?: string;
    totalAmount?: number;
    message?: string;
    error?: string;
}

/**
 * Create escrow transaction
 */
export async function createEscrowTransaction(data: {
    sellerId?: string;
    courierId?: string;
    localOrderId?: string;
    productAmount: number;
    shippingFee: number;
}): Promise<EscrowResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data: result, error } = await supabase.rpc('create_escrow_transaction', {
            p_buyer_id: user.id,
            p_seller_id: data.sellerId || null,
            p_courier_id: data.courierId || null,
            p_local_order_id: data.localOrderId || null,
            p_product_amount: data.productAmount,
            p_shipping_fee: data.shippingFee,
        });

        if (error || !result || result.length === 0) {
            return { success: false, error: 'Failed to create escrow' };
        }

        const escrow = result[0];

        if (!escrow.success) {
            return { success: false, error: escrow.message };
        }

        revalidatePath('/dashboard/rekber');
        return {
            success: true,
            escrowId: escrow.escrow_id,
            transactionCode: escrow.transaction_code,
            releaseCode: escrow.release_code,
            totalAmount: escrow.total_amount,
            message: escrow.message,
        };
    } catch (error) {
        console.error('Error creating escrow:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Release escrow with code
 */
export async function releaseEscrow(
    escrowId: string,
    releaseCode: string
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase.rpc('release_escrow', {
            p_escrow_id: escrowId,
            p_release_code: releaseCode,
            p_actor_id: user.id,
        });

        if (error || !data || data.length === 0) {
            return { success: false, error: 'Failed to release escrow' };
        }

        const result = data[0];

        if (!result.success) {
            return { success: false, error: result.message };
        }

        revalidatePath('/dashboard/rekber');
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error releasing escrow:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get my escrow transactions (as buyer)
 */
export async function getMyEscrowAsBuyer() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching escrow:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Get escrow transactions (as courier)
 */
export async function getMyEscrowAsCourier() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('courier_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching escrow:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Get escrow details
 */
export async function getEscrowDetails(escrowId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('escrow_transactions')
            .select(`
        *,
        escrow_history (
          event_type,
          description,
          actor_type,
          created_at
        )
      `)
            .eq('id', escrowId)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},courier_id.eq.${user.id}`)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error fetching escrow:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Get escrow by transaction code
 */
export async function getEscrowByCode(transactionCode: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('transaction_code', transactionCode)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},courier_id.eq.${user.id}`)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error fetching escrow:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Cancel escrow (refund buyer)
 */
export async function cancelEscrow(escrowId: string, reason?: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get escrow
        const { data: escrow } = await supabase
            .from('escrow_transactions')
            .select('*')
            .eq('id', escrowId)
            .eq('buyer_id', user.id)
            .single();

        if (!escrow) {
            return { success: false, error: 'Escrow not found' };
        }

        if (escrow.status !== 'funded') {
            return { success: false, error: 'Cannot cancel - transaction in progress' };
        }

        // Refund buyer
        const { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', user.id)
            .single();

        if (wallet) {
            const refundAmount = escrow.total_amount * 100;

            await supabase
                .from('wallets')
                .update({
                    balance: wallet.balance + refundAmount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.id);

            await supabase.from('wallet_transactions').insert({
                wallet_id: wallet.id,
                type: 'refund',
                amount: refundAmount,
                description: `Refund rekber: ${escrow.transaction_code}`,
                reference_id: escrow.transaction_code,
            });
        }

        // Update escrow
        await supabase
            .from('escrow_transactions')
            .update({
                status: 'cancelled',
                notes: reason,
                updated_at: new Date().toISOString(),
            })
            .eq('id', escrowId);

        // Log history
        await supabase.from('escrow_history').insert({
            escrow_id: escrowId,
            event_type: 'cancelled',
            description: reason || 'Buyer cancelled transaction',
            actor_id: user.id,
            actor_type: 'buyer',
        });

        revalidatePath('/dashboard/rekber');
        return { success: true, message: 'Escrow cancelled and refunded' };
    } catch (error) {
        console.error('Error cancelling escrow:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Format currency
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
