'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface PayLaterResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Apply for PayLater credit
 */
export async function applyForPayLater(requestedLimit: number): Promise<PayLaterResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Check if already has credit account
        const { data: existing } = await supabase
            .from('paylater_seller_credit')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return {
                success: false,
                message: 'You already have a PayLater account',
                error: 'ALREADY_EXISTS',
                data: existing,
            };
        }

        // Create credit account (pending approval)
        const { data: creditAccount, error: createError } = await supabase
            .from('paylater_seller_credit')
            .insert({
                user_id: user.id,
                credit_limit: requestedLimit,
                available_credit: 0, // Will be set after approval
                is_approved: false, // Requires admin approval
                is_active: false,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating credit account:', createError);
            return {
                success: false,
                message: 'Failed to create credit account',
                error: 'CREATE_FAILED',
            };
        }

        revalidatePath('/dashboard/paylater');

        return {
            success: true,
            message: 'Application submitted! Awaiting approval.',
            data: creditAccount,
        };
    } catch (error) {
        console.error('Error in applyForPayLater:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Request shipping cost advance
 */
export async function requestShippingAdvance(
    orderId: string,
    shippingCost: number
): Promise<PayLaterResult> {
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

        // Call database function to process advance
        const { data, error } = await supabase.rpc('process_shipping_advance', {
            p_seller_id: user.id,
            p_order_id: orderId,
            p_amount: shippingCost,
        });

        if (error) {
            console.error('Error processing advance:', error);

            // Handle specific errors
            if (error.message.includes('not approved')) {
                return {
                    success: false,
                    message: 'Your PayLater account is not approved yet',
                    error: 'NOT_APPROVED',
                };
            }

            if (error.message.includes('Insufficient credit')) {
                return {
                    success: false,
                    message: 'Insufficient credit limit',
                    error: 'INSUFFICIENT_CREDIT',
                };
            }

            return {
                success: false,
                message: 'Failed to process advance',
                error: 'PROCESS_FAILED',
            };
        }

        revalidatePath('/dashboard/paylater');

        return {
            success: true,
            message: 'Shipping cost advanced successfully!',
            data: { transactionId: data },
        };
    } catch (error) {
        console.error('Error in requestShippingAdvance:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get seller's PayLater account details
 */
export async function getPayLaterAccount() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('paylater_seller_credit')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = not found, which is okay
            console.error('Error fetching PayLater account:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error in getPayLaterAccount:', error);
        return { data: null, error: 'Failed to fetch account' };
    }
}

/**
 * Get seller's PayLater transactions
 */
export async function getPayLaterTransactions(limit: number = 50) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('paylater_transactions')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { data: null, error: 'Failed to fetch transactions' };
    }
}

/**
 * Make repayment
 */
export async function makePayLaterRepayment(
    amount: number,
    paymentMethod: string,
    paymentReference: string
): Promise<PayLaterResult> {
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

        // Get credit account
        const { data: creditAccount } = await supabase
            .from('paylater_seller_credit')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!creditAccount) {
            return {
                success: false,
                message: 'No PayLater account found',
                error: 'NO_ACCOUNT',
            };
        }

        if (amount > creditAccount.current_outstanding) {
            return {
                success: false,
                message: 'Repayment amount exceeds outstanding balance',
                error: 'AMOUNT_EXCEEDS_OUTSTANDING',
            };
        }

        // Create repayment transaction
        const { data: transaction, error: txError } = await supabase
            .from('paylater_transactions')
            .insert({
                seller_id: user.id,
                credit_account_id: creditAccount.id,
                transaction_type: 'repayment',
                amount: amount,
                payment_method: paymentMethod,
                payment_reference: paymentReference,
                status: 'pending', // Will be confirmed by admin/payment gateway
            })
            .select()
            .single();

        if (txError) {
            console.error('Error creating repayment:', txError);
            return {
                success: false,
                message: 'Failed to record repayment',
                error: 'REPAYMENT_FAILED',
            };
        }

        revalidatePath('/dashboard/paylater');

        return {
            success: true,
            message: 'Repayment submitted! Awaiting confirmation.',
            data: transaction,
        };
    } catch (error) {
        console.error('Error in makePayLaterRepayment:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Calculate available credit after pending transactions
 */
export async function calculateAvailableCredit() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data: account } = await supabase
            .from('paylater_seller_credit')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!account) {
            return { data: 0, error: null };
        }

        return { data: account.available_credit, error: null };
    } catch (error) {
        console.error('Error calculating credit:', error);
        return { data: null, error: 'Failed to calculate credit' };
    }
}
