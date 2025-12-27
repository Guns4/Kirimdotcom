'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface ImportResult {
    success: boolean;
    batchId?: string;
    imported: number;
    skipped: number;
    errors: number;
    message: string;
}

/**
 * Create import batch
 */
export async function createImportBatch(
    source: string,
    fileName: string,
    totalRows: number
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('import_batches')
            .insert({
                user_id: user.id,
                source,
                file_name: fileName,
                total_rows: totalRows,
                status: 'processing',
            })
            .select()
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error creating import batch:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Import single order
 */
export async function importOrder(
    source: string,
    sourceOrderId: string,
    orderNumber: string,
    orderDate: string | null,
    customerName: string | null,
    customerPhone: string | null,
    customerAddress: string | null,
    products: any[] | null,
    totalAmount: number,
    courier: string | null,
    awb: string | null,
    batchId: string,
    rawData: any
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase.rpc('import_order', {
            p_user_id: user.id,
            p_source: source,
            p_source_order_id: sourceOrderId,
            p_order_number: orderNumber,
            p_order_date: orderDate,
            p_customer_name: customerName,
            p_customer_phone: customerPhone,
            p_customer_address: customerAddress,
            p_products: products ? JSON.stringify(products) : null,
            p_total_amount: totalAmount,
            p_courier: courier,
            p_awb: awb,
            p_import_batch_id: batchId,
            p_raw_data: JSON.stringify(rawData),
        });

        if (error) {
            console.error('Import order error:', error);
            return { success: false, isDuplicate: false, error: error.message };
        }

        const result = data?.[0];
        return {
            success: result?.success || false,
            isDuplicate: result?.is_duplicate || false,
            orderId: result?.order_id,
        };
    } catch (error) {
        console.error('Error importing order:', error);
        return { success: false, isDuplicate: false, error: 'System error' };
    }
}

/**
 * Update import batch stats
 */
export async function updateImportBatch(
    batchId: string,
    stats: {
        importedCount?: number;
        skippedCount?: number;
        errorCount?: number;
        status?: string;
        columnMapping?: any;
    }
) {
    try {
        const supabase = await createClient();

        const updateData: any = {};
        if (stats.importedCount !== undefined) updateData.imported_count = stats.importedCount;
        if (stats.skippedCount !== undefined) updateData.skipped_count = stats.skippedCount;
        if (stats.errorCount !== undefined) updateData.error_count = stats.errorCount;
        if (stats.status) updateData.status = stats.status;
        if (stats.columnMapping) updateData.column_mapping = stats.columnMapping;
        if (stats.status === 'completed' || stats.status === 'failed') {
            updateData.completed_at = new Date().toISOString();
        }

        await supabase
            .from('import_batches')
            .update(updateData)
            .eq('id', batchId);
    } catch (error) {
        console.error('Error updating batch:', error);
    }
}

/**
 * Get import history
 */
export async function getImportHistory(limit: number = 20) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('import_batches')
            .select('*')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching import history:', error);
        return { data: null, error: 'Failed to fetch history' };
    }
}

/**
 * Get orders with filtering
 */
export async function getOrders(filters?: {
    source?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
}, limit: number = 50) {
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
            .eq('user_id', user.id)
            .order('order_date', { ascending: false })
            .limit(limit);

        if (filters?.source) {
            query = query.eq('source', filters.source);
        }
        if (filters?.status) {
            query = query.eq('order_status', filters.status);
        }
        if (filters?.fromDate) {
            query = query.gte('order_date', filters.fromDate);
        }
        if (filters?.toDate) {
            query = query.lte('order_date', filters.toDate);
        }
        if (filters?.search) {
            query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,awb_number.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { data: null, error: 'Failed to fetch orders' };
    }
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Get counts by source
        const { data: bySource } = await supabase
            .from('orders')
            .select('source')
            .eq('user_id', user.id);

        const sourceCounts: Record<string, number> = {};
        bySource?.forEach((order) => {
            sourceCounts[order.source] = (sourceCounts[order.source] || 0) + 1;
        });

        // Get total orders today
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today);

        // Get total revenue
        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', user.id);

        const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

        return {
            data: {
                bySource: sourceCounts,
                totalOrders: bySource?.length || 0,
                todayOrders: todayCount || 0,
                totalRevenue,
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return { data: null, error: 'Failed to fetch stats' };
    }
}

/**
 * Get column presets for a marketplace
 */
export async function getColumnPresets(source?: string) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('import_column_presets')
            .select('*')
            .eq('is_active', true);

        if (source) {
            query = query.eq('source', source);
        }

        const { data, error } = await query;

        return { data, error };
    } catch (error) {
        console.error('Error fetching presets:', error);
        return { data: null, error: 'Failed to fetch presets' };
    }
}
