import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSmmOrderStatus } from '@/lib/api/smm-provider';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/cron/sync-smm
// Cron job to sync SMM order statuses
// Runs every hour to check order completion
// ==========================================

export async function GET(req: Request) {
    try {
        // ==========================================
        // 🔒 SECURITY CHECK: Cron Secret Bearer Token
        // ==========================================
        const authHeader = req.headers.get('authorization');
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        if (!authHeader || authHeader !== expectedAuth) {
            console.warn('[Cron Sync SMM] Unauthorized access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[Cron Sync SMM] ✅ Authorized - Starting sync...');

        // ==========================================
        // 1. Fetch Processing Digital Orders
        // ==========================================
        const { data: orders, error: fetchError } = await supabase
            .from('marketplace_orders')
            .select(`
        id,
        trx_id,
        provider_order_id,
        created_at,
        marketplace_order_items (
          id,
          product_name,
          product_type,
          status,
          provider_data
        )
      `)
            .eq('order_status', 'PROCESSING')
            .not('provider_order_id', 'is', null)
            .order('created_at', { ascending: true })
            .limit(50);

        if (fetchError) {
            throw fetchError;
        }

        if (!orders || orders.length === 0) {
            console.log('[Cron Sync SMM] No orders to sync');
            return NextResponse.json({
                success: true,
                message: 'No pending orders to sync',
                synced: 0,
            });
        }

        console.log(`[Cron Sync SMM] Found ${orders.length} orders to check`);

        // ==========================================
        // 2. Sync Each Order with Provider
        // ==========================================
        let syncedCount = 0;
        let completedCount = 0;
        let failedCount = 0;

        for (const order of orders) {
            try {
                // Skip if no provider order ID
                if (!order.provider_order_id) continue;

                console.log(`[Cron Sync SMM] Checking order ${order.trx_id} (${order.provider_order_id})`);

                // Check status from SMM provider
                const providerStatus = await checkSmmOrderStatus(order.provider_order_id);

                if (!providerStatus) {
                    console.warn(`[Cron Sync SMM] No status returned for ${order.provider_order_id}`);
                    continue;
                }

                syncedCount++;

                const statusLower = providerStatus.status.toLowerCase();
                let newOrderStatus = 'PROCESSING';
                let itemStatus = 'PROCESSING';

                // Determine status based on provider response
                if (
                    statusLower.includes('completed') ||
                    statusLower.includes('complete') ||
                    statusLower.includes('sukses') ||
                    providerStatus.remains === 0
                ) {
                    newOrderStatus = 'COMPLETED';
                    itemStatus = 'COMPLETED';
                    completedCount++;

                    console.log(`[Cron Sync SMM] ✅ Order ${order.trx_id} completed!`);
                } else if (
                    statusLower.includes('failed') ||
                    statusLower.includes('canceled') ||
                    statusLower.includes('gagal')
                ) {
                    newOrderStatus = 'FAILED';
                    itemStatus = 'FAILED';
                    failedCount++;

                    console.log(`[Cron Sync SMM] ❌ Order ${order.trx_id} failed`);
                } else {
                    console.log(`[Cron Sync SMM] ⏳ Order ${order.trx_id} still processing (${providerStatus.status})`);
                }

                // Update order status
                const { error: orderUpdateError } = await supabase
                    .from('marketplace_orders')
                    .update({
                        order_status: newOrderStatus,
                        completed_at: newOrderStatus === 'COMPLETED' ? new Date().toISOString() : null,
                        provider_response: providerStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', order.id);

                if (orderUpdateError) {
                    console.error(`[Cron Sync SMM] Failed to update order ${order.trx_id}:`, orderUpdateError);
                    continue;
                }

                // Update order items status
                const digitalItems = order.marketplace_order_items?.filter(
                    (item: any) => item.product_type === 'DIGITAL_SMM'
                );

                if (digitalItems && digitalItems.length > 0) {
                    for (const item of digitalItems) {
                        const { error: itemUpdateError } = await supabase
                            .from('marketplace_order_items')
                            .update({
                                status: itemStatus,
                                provider_data: {
                                    ...item.provider_data,
                                    status: providerStatus.status,
                                    start_count: providerStatus.start_count,
                                    remains: providerStatus.remains,
                                    last_checked: new Date().toISOString(),
                                },
                            })
                            .eq('id', item.id);

                        if (itemUpdateError) {
                            console.error(`[Cron Sync SMM] Failed to update item ${item.id}:`, itemUpdateError);
                        }
                    }
                }

                // TODO: Send notification if completed
                if (newOrderStatus === 'COMPLETED') {
                    // await sendCompletionNotification(order);
                }

            } catch (orderError: any) {
                console.error(`[Cron Sync SMM] Error processing order ${order.trx_id}:`, orderError.message);
                continue;
            }
        }

        // ==========================================
        // 3. Return Summary
        // ==========================================
        console.log('[Cron Sync SMM] ✅ Sync completed', {
            total_checked: orders.length,
            synced: syncedCount,
            completed: completedCount,
            failed: failedCount,
        });

        return NextResponse.json({
            success: true,
            message: 'SMM order sync completed',
            summary: {
                total_orders_checked: orders.length,
                successfully_synced: syncedCount,
                newly_completed: completedCount,
                newly_failed: failedCount,
                still_processing: syncedCount - completedCount - failedCount,
            },
        });

    } catch (error: any) {
        console.error('[Cron Sync SMM] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'SMM sync failed',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// POST endpoint for manual trigger
// ==========================================

export async function POST(req: Request) {
    // Same logic as GET but for manual admin trigger
    return GET(req);
}
