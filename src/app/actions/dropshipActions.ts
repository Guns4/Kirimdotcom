'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Connect to supplier (as reseller)
 */
export async function connectToSupplier(
    supplierId: string,
    storeName: string
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();

        // Request connection
        const { error } = await supabase.from('reseller_connections').insert({
            supplier_id: supplierId,
            reseller_id: user.id,
            reseller_name: profile?.full_name || 'Reseller',
            reseller_phone: profile?.phone,
            store_name: storeName,
            status: 'pending',
        });

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Already connected to this supplier' };
            }
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Connection request sent!' };
    } catch (error) {
        console.error('Error connecting:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get my supplier connections (as reseller)
 */
export async function getMyConnections() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('reseller_connections')
            .select(`
        *,
        suppliers (
          id,
          business_name,
          business_logo,
          contact_whatsapp,
          city
        )
      `)
            .eq('reseller_id', user.id)
            .order('connected_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching connections:', error);
        return { data: null, error: 'Failed to fetch connections' };
    }
}

/**
 * Create dropship order (as reseller)
 */
export async function createDropshipOrder(order: {
    supplierId: string;
    products: { productId?: string; name: string; qty: number; resellerPrice: number }[];
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity?: string;
    senderName: string;
    senderPhone?: string;
    courier?: string;
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

        const { data, error } = await supabase.rpc('create_dropship_order', {
            p_reseller_id: user.id,
            p_supplier_id: order.supplierId,
            p_products: JSON.stringify(order.products),
            p_customer_name: order.customerName,
            p_customer_phone: order.customerPhone,
            p_customer_address: order.customerAddress,
            p_customer_city: order.customerCity || null,
            p_sender_name: order.senderName,
            p_sender_phone: order.senderPhone || null,
            p_courier: order.courier || null,
            p_notes: order.notes || null,
        });

        if (error || !data || data.length === 0) {
            return { success: false, error: 'Failed to create order' };
        }

        const result = data[0];

        if (!result.success) {
            return { success: false, error: result.message };
        }

        revalidatePath('/dashboard/dropship');
        return {
            success: true,
            orderId: result.order_id,
            orderNumber: result.order_number,
            message: result.message,
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get my dropship orders (as reseller)
 */
export async function getMyDropshipOrders(status?: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        let query = supabase
            .from('dropship_orders')
            .select(`
        *,
        suppliers (
          id,
          business_name
        )
      `)
            .eq('reseller_id', user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('order_status', status);
        }

        const { data, error } = await query.limit(100);

        return { data, error };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { data: null, error: 'Failed to fetch orders' };
    }
}

/**
 * Get supplier's dropship orders (as supplier)
 */
export async function getSupplierDropshipOrders(status?: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Get supplier
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return { data: null, error: 'Not a supplier' };
        }

        let query = supabase
            .from('dropship_orders')
            .select(`
        *,
        reseller_connections (
          reseller_name,
          store_name
        )
      `)
            .eq('supplier_id', supplier.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('order_status', status);
        }

        const { data, error } = await query.limit(100);

        return { data, error };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { data: null, error: 'Failed to fetch orders' };
    }
}

/**
 * Update dropship order (as supplier)
 */
export async function updateDropshipOrder(
    orderId: string,
    status: string,
    awb?: string,
    notes?: string
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase.rpc('supplier_update_dropship', {
            p_order_id: orderId,
            p_supplier_user_id: user.id,
            p_status: status,
            p_awb: awb || null,
            p_notes: notes || null,
        });

        if (error || !data || data.length === 0) {
            return { success: false, error: 'Failed to update order' };
        }

        const result = data[0];

        if (!result.success) {
            return { success: false, error: result.message };
        }

        revalidatePath('/dashboard/supplier/orders');
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error updating order:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Approve/reject connection (as supplier)
 */
export async function updateConnectionStatus(
    connectionId: string,
    status: 'active' | 'rejected' | 'suspended'
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify ownership via supplier
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return { success: false, error: 'Not a supplier' };
        }

        const { error } = await supabase
            .from('reseller_connections')
            .update({
                status,
                activated_at: status === 'active' ? new Date().toISOString() : null,
            })
            .eq('id', connectionId)
            .eq('supplier_id', supplier.id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/supplier/resellers');
        return { success: true, message: `Connection ${status}` };
    } catch (error) {
        console.error('Error updating connection:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get reseller connections (as supplier)
 */
export async function getSupplierResellers() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return { data: null, error: 'Not a supplier' };
        }

        const { data, error } = await supabase
            .from('reseller_connections')
            .select('*')
            .eq('supplier_id', supplier.id)
            .order('connected_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching resellers:', error);
        return { data: null, error: 'Failed to fetch resellers' };
    }
}
