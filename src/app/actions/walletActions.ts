import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface WalletResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Get or create wallet for current user
 */
export async function getOrCreateWallet() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Try to get existing wallet
        let { data: wallet, error } = await supabase
            .from('wallet_accounts')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If no wallet exists, create one
        if (error && error.code === 'PGRST116') {
            const { data: newWallet, error: createError } = await supabase
                .rpc('create_wallet_account', { p_user_id: user.id });

            if (createError) {
                return { data: null, error: createError.message };
            }

            // Fetch the newly created wallet
            const { data: createdWallet } = await supabase
                .from('wallet_accounts')
                .select('*')
                .eq('user_id', user.id)
                .single();

            wallet = createdWallet;
        }

        return { data: wallet, error: null };
    } catch (error) {
        console.error('Error in getOrCreateWallet:', error);
        return { data: null, error: 'Failed to get wallet' };
    }
}

/**
 * Deposit money into wallet
 */
export async function depositToWallet(
    amount: number,
    description: string = 'Top up saldo'
): Promise<WalletResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Get wallet
        const { data: wallet } = await getOrCreateWallet();
        if (!wallet) {
            return {
                success: false,
                message: 'Wallet not found',
                error: 'NO_WALLET',
            };
        }

        // Convert to cents (smallest unit)
        const amountInCents = Math.round(amount * 100);

        // Generate idempotency key
        const idempotencyKey = `deposit-${user.id}-${Date.now()}`;

        // Call database function
        const { data: txId, error } = await supabase.rpc('wallet_deposit', {
            p_wallet_id: wallet.id,
            p_amount: amountInCents,
            p_description: description,
            p_idempotency_key: idempotencyKey,
        });

        if (error) {
            console.error('Deposit error:', error);
            return {
                success: false,
                message: 'Failed to deposit',
                error: 'DEPOSIT_FAILED',
            };
        }

        revalidatePath('/dashboard/wallet');

        return {
            success: true,
            message: 'Deposit berhasil!',
            data: { transactionId: txId },
        };
    } catch (error) {
        console.error('Error in depositToWallet:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Withdraw money from wallet
 */
export async function withdrawFromWallet(
    amount: number,
    description: string = 'Penarikan saldo'
): Promise<WalletResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Get wallet
        const { data: wallet } = await getOrCreateWallet();
        if (!wallet) {
            return {
                success: false,
                message: 'Wallet not found',
                error: 'NO_WALLET',
            };
        }

        const amountInCents = Math.round(amount * 100);
        const idempotencyKey = `withdraw-${user.id}-${Date.now()}`;

        const { data: txId, error } = await supabase.rpc('wallet_withdraw', {
            p_wallet_id: wallet.id,
            p_amount: amountInCents,
            p_description: description,
            p_idempotency_key: idempotencyKey,
        });

        if (error) {
            console.error('Withdraw error:', error);

            if (error.message.includes('Insufficient balance')) {
                return {
                    success: false,
                    message: 'Saldo tidak mencukupi',
                    error: 'INSUFFICIENT_BALANCE',
                };
            }

            return {
                success: false,
                message: 'Failed to withdraw',
                error: 'WITHDRAW_FAILED',
            };
        }

        revalidatePath('/dashboard/wallet');

        return {
            success: true,
            message: 'Penarikan berhasil!',
            data: { transactionId: txId },
        };
    } catch (error) {
        console.error('Error in withdrawFromWallet:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Transfer between wallets
 */
export async function transferToUser(
    toUserId: string,
    amount: number,
    description: string = 'Transfer'
): Promise<WalletResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Get sender wallet
        const { data: fromWallet } = await getOrCreateWallet();
        if (!fromWallet) {
            return {
                success: false,
                message: 'Wallet not found',
                error: 'NO_WALLET',
            };
        }

        // Get receiver wallet
        const { data: toWallet } = await supabase
            .from('wallet_accounts')
            .select('*')
            .eq('user_id', toUserId)
            .single();

        if (!toWallet) {
            return {
                success: false,
                message: 'Recipient wallet not found',
                error: 'RECIPIENT_NOT_FOUND',
            };
        }

        const amountInCents = Math.round(amount * 100);
        const idempotencyKey = `transfer-${user.id}-${toUserId}-${Date.now()}`;

        const { data: txId, error } = await supabase.rpc('wallet_transfer', {
            p_from_wallet_id: fromWallet.id,
            p_to_wallet_id: toWallet.id,
            p_amount: amountInCents,
            p_description: description,
            p_idempotency_key: idempotencyKey,
        });

        if (error) {
            console.error('Transfer error:', error);

            if (error.message.includes('Insufficient balance')) {
                return {
                    success: false,
                    message: 'Saldo tidak mencukupi',
                    error: 'INSUFFICIENT_BALANCE',
                };
            }

            return {
                success: false,
                message: 'Failed to transfer',
                error: 'TRANSFER_FAILED',
            };
        }

        revalidatePath('/dashboard/wallet');

        return {
            success: true,
            message: 'Transfer berhasil!',
            data: { transactionId: txId },
        };
    } catch (error) {
        console.error('Error in transferToUser:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get wallet transactions
 */
export async function getWalletTransactions(limit: number = 50) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data: wallet } = await getOrCreateWallet();
        if (!wallet) {
            return { data: [], error: null };
        }

        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .or(`from_wallet_id.eq.${wallet.id},to_wallet_id.eq.${wallet.id}`)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data: data || [], error };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { data: null, error: 'Failed to fetch transactions' };
    }
}

/**
 * Format amount from cents to IDR
 */
export function formatIDR(amountInCents: number): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
