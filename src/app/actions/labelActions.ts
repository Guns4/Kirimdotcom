'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get orders ready for label printing
 */
export async function getOrdersForLabels(orderIds?: string[]) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        let query = supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id);

        if (orderIds && orderIds.length > 0) {
            query = query.in('id', orderIds);
        } else {
            // Default: get orders without labels printed
            query = query
                .is('awb_number', null)
                .order('created_at', { ascending: false })
                .limit(50);
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching orders for labels:', error);
        return { data: null, error: 'Failed to fetch orders' };
    }
}

/**
 * Get seller profile for label sender info
 */
export async function getSellerInfo() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, phone, address, business_name')
            .eq('id', user.id)
            .single();

        return {
            data: {
                name: data?.business_name || data?.full_name || 'Seller',
                phone: data?.phone,
                address: data?.address,
            },
            error,
        };
    } catch (error) {
        console.error('Error fetching seller info:', error);
        return { data: null, error: 'Failed to fetch seller info' };
    }
}

/**
 * Mark orders as printed
 */
export async function markOrdersPrinted(orderIds: string[]) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('orders')
            .update({
                order_status: 'processing',
                updated_at: new Date().toISOString(),
            })
            .in('id', orderIds)
            .eq('user_id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: `${orderIds.length} orders marked as printed` };
    } catch (error) {
        console.error('Error marking orders printed:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Create manual order for label printing
 */
export async function createManualOrder(orderData: {
    orderNumber: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientCity?: string;
    productName?: string;
    quantity?: number;
    totalAmount?: number;
    courier?: string;
    weight?: number;
    notes?: string;
}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                source: 'manual',
                source_order_id: orderData.orderNumber,
                order_number: orderData.orderNumber,
                order_date: new Date().toISOString(),
                customer_name: orderData.recipientName,
                customer_phone: orderData.recipientPhone,
                customer_address: orderData.recipientAddress,
                products: [{
                    name: orderData.productName || 'Item',
                    qty: orderData.quantity || 1,
                }],
                total_amount: orderData.totalAmount || 0,
                courier: orderData.courier,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error creating manual order:', error);
        return { success: false, error: 'System error' };
    }
}
