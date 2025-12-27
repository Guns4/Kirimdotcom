'use server';

import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

interface PaymentResult {
    success: boolean;
    message: string;
    snapToken?: string;
    redirectUrl?: string;
    error?: string;
}

/**
 * Create Midtrans payment for PPOB
 */
export async function createPPOBPayment(
    phoneNumber: string,
    operator: string,
    productId: number,
    nominal: number,
    price: number
): Promise<PaymentResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Not authenticated',
                error: 'UNAUTHORIZED',
            };
        }

        const adminFee = 1000;
        const totalAmount = price + adminFee;

        // Create payment transaction
        const { data: transactionId } = await supabase.rpc('create_payment_transaction', {
            p_user_id: user.id,
            p_order_type: 'ppob',
            p_product_name: `Pulsa ${operator} ${nominal}`,
            p_gross_amount: totalAmount,
            p_product_data: JSON.stringify({
                phone_number: phoneNumber,
                operator,
                product_id: productId,
                nominal,
            }),
        });

        // Get order ID
        const { data: transaction } = await supabase
            .from('payment_transactions')
            .select('order_id')
            .eq('id', transactionId)
            .single();

        if (!transaction) {
            return {
                success: false,
                message: 'Failed to create transaction',
                error: 'TRANSACTION_FAILED',
            };
        }

        // Create Midtrans Snap token
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
        const isProduction = process.env.MIDTRANS_ENVIRONMENT === 'production';

        const snapUrl = isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const auth = Buffer.from(serverKey + ':').toString('base64');

        const snapResponse = await fetch(snapUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: transaction.order_id,
                    gross_amount: totalAmount,
                },
                customer_details: {
                    email: user.email,
                    phone: phoneNumber,
                },
                item_details: [
                    {
                        id: productId.toString(),
                        price: price,
                        quantity: 1,
                        name: `Pulsa ${operator} Rp ${nominal}`,
                    },
                    {
                        id: 'admin_fee',
                        price: adminFee,
                        quantity: 1,
                        name: 'Biaya Admin',
                    },
                ],
            }),
        });

        const snapData = await snapResponse.json();

        if (!snapData.token) {
            return {
                success: false,
                message: 'Failed to create payment',
                error: 'SNAP_FAILED',
            };
        }

        // Save snap token
        await supabase
            .from('payment_transactions')
            .update({
                snap_token: snapData.token,
                redirect_url: snapData.redirect_url,
            })
            .eq('id', transactionId);

        // Create PPOB order
        await supabase.from('ppob_orders').insert({
            payment_id: transactionId,
            user_id: user.id,
            product_code: `TELKOMSEL_${nominal}`, // This should map to actual PPOB codes
            destination: phoneNumber,
            operator,
            nominal,
            base_price: price,
            selling_price: price,
            admin_fee: adminFee,
            status: 'pending',
        });

        return {
            success: true,
            message: 'Payment created',
            snapToken: snapData.token,
            redirectUrl: snapData.redirect_url,
        };
    } catch (error) {
        console.error('Error creating PPOB payment:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get user payment history
 */
export async function getPaymentHistory(limit: number = 20) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return { data: null, error: 'Failed to fetch history' };
    }
}
