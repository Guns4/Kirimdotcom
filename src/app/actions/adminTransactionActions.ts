'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminAuth';

interface AdminResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Get all payment history
 */
export async function getAllPayments(status?: string) {
    try {
        await requireAdmin();

        const supabase = await createClient();

        let query = supabase
            .from('payment_history')
            .select('*, user_subscriptions(plan_type)')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching payments:', error);
        return { data: null, error: 'Failed to fetch payments' };
    }
}

/**
 * Approve manual payment
 */
export async function approvePayment(
    paymentId: string,
    planCode: string,
    billingCycle: string
): Promise<AdminResult> {
    try {
        const admin = await requireAdmin();
        const supabase = await createClient();

        // Get payment details
        const { data: payment } = await (supabase as any)
            .from('payment_history')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found',
                error: 'NOT_FOUND',
            };
        }

        // Update payment status
        await (supabase as any)
            .from('payment_history')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                confirmed_by: admin.id,
            })
            .eq('id', paymentId);

        // Create/update subscription
        const { error: subError } = await (supabase as any)
            .rpc('upsert_user_subscription', {
                p_user_id: payment.user_id,
                p_plan_code: planCode,
                p_billing_cycle: billingCycle,
                p_price_paid: payment.amount,
            });

        if (subError) {
            console.error('Subscription error:', subError);
            return {
                success: false,
                message: 'Failed to create subscription',
                error: 'SUBSCRIPTION_FAILED',
            };
        }

        revalidatePath('/admin/transactions');

        return {
            success: true,
            message: 'Payment approved and subscription activated!',
        };
    } catch (error) {
        console.error('Error in approvePayment:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Reject payment
 */
export async function rejectPayment(paymentId: string, reason: string): Promise<AdminResult> {
    try {
        const admin = await requireAdmin();
        const supabase = await createClient();

        const { error } = await (supabase as any)
            .from('payment_history')
            .update({
                status: 'rejected',
                notes: reason,
                confirmed_by: admin.id,
                confirmed_at: new Date().toISOString(),
            })
            .eq('id', paymentId);

        if (error) {
            return {
                success: false,
                message: 'Failed to reject payment',
                error: 'REJECT_FAILED',
            };
        }

        revalidatePath('/admin/transactions');

        return {
            success: true,
            message: 'Payment rejected',
        };
    } catch (error) {
        console.error('Error in rejectPayment:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get all users
 */
export async function getAllUsers(search?: string) {
    try {
        await requireAdmin();

        const supabase = await createClient();

        let query = supabase
            .from('profiles')
            .select('*, user_subscriptions(plan_type, is_premium, expires_at)')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { data: null, error: 'Failed to fetch users' };
    }
}

/**
 * Grant premium to user
 */
export async function grantPremiumManual(
    userId: string,
    planCode: string,
    duration: 'monthly' | 'yearly'
): Promise<AdminResult> {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { error } = await (supabase as any)
            .rpc('upsert_user_subscription', {
                p_user_id: userId,
                p_plan_code: planCode,
                p_billing_cycle: duration,
                p_price_paid: 0, // Free manual grant
            });

        if (error) {
            console.error('Grant premium error:', error);
            return {
                success: false,
                message: 'Failed to grant premium',
                error: 'GRANT_FAILED',
            };
        }

        revalidatePath('/admin/transactions');

        return {
            success: true,
            message: `Premium ${planCode} granted successfully!`,
        };
    } catch (error) {
        console.error('Error in grantPremiumManual:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Ban/Unban user
 */
export async function toggleUserBan(userId: string, ban: boolean): Promise<AdminResult> {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { error } = await (supabase as any)
            .from('profiles')
            .update({ is_banned: ban })
            .eq('id', userId);

        if (error) {
            console.error('Ban toggle error:', error);
            return {
                success: false,
                message: 'Failed to update user status',
                error: 'BAN_FAILED',
            };
        }

        revalidatePath('/admin/transactions');

        return {
            success: true,
            message: ban ? 'User banned' : 'User unbanned',
        };
    } catch (error) {
        console.error('Error in toggleUserBan:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}
