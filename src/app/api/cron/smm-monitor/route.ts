import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSmmOrderStatus } from '@/lib/api/smm-provider';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/cron/smm-monitor
// Auto-monitor SMM orders and auto-refund
// ==========================================

export async function POST(req: Request) {
    try {
        // ==========================================
        // 🔒 SECURITY CHECK: Cron Secret
        // ==========================================
        const authHeader = req.headers.get('authorization');
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        if (!authHeader || authHeader !== expectedAuth) {
            console.warn('[SMM Monitor] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[SMM Monitor] ✅ Authorized - Starting monitoring...');

        // ==========================================
        // 1. Fetch Active SMM Orders
        // ==========================================
        const { data: activeItems, error: fetchError } = await supabase
            .from('marketplace_order_items')
            .select(`
        *,
        marketplace_orders!inner (
          id,
          user_id,
          trx_id,
          total_amount
        )
      `)
            .not('provider_order_id', 'is', null)
            .in('provider_status', ['SUBMITTED', 'PENDING', 'PROCESSING'])
            .eq('product_type', 'DIGITAL_SMM');

        if (fetchError) {
            throw fetchError;
        }

        if (!activeItems || activeItems.length === 0) {
            console.log('[SMM Monitor] No active orders to monitor');
            return NextResponse.json({
                success: true,
                message: 'No active SMM orders to monitor',
                checked: 0,
            });
        }

        console.log(`[SMM Monitor] Found ${activeItems.length} active orders to check`);

        // ==========================================
        // 2. Monitor Each Order
        // ==========================================
        let processedCount = 0;
        let completedCount = 0;
        let partialCount = 0;
        let canceledCount = 0;
        let refundedAmount = 0;

        for (const item of activeItems) {
            try {
                console.log(`[SMM Monitor] Checking order: ${item.provider_order_id}`);

                // Check status from provider
                const providerStatus = await checkSmmOrderStatus(item.provider_order_id);

                if (!providerStatus) {
                    console.warn(`[SMM Monitor] No status returned for ${item.provider_order_id}`);
                    continue;
                }

                const statusUpper = providerStatus.status.toUpperCase();
                let newStatus = statusUpper;

                // Map provider status to our status
                if (
                    statusUpper.includes('SUCCESS') ||
                    statusUpper.includes('COMPLETE') ||
                    providerStatus.remains === 0
                ) {
                    newStatus = 'COMPLETED';
                    completedCount++;
                } else if (statusUpper.includes('PARTIAL')) {
                    newStatus = 'PARTIAL';
                    partialCount++;
                } else if (
                    statusUpper.includes('CANCEL') ||
                    statusUpper.includes('FAILED') ||
                    statusUpper.includes('ERROR')
                ) {
                    newStatus = 'CANCELED';
                    canceledCount++;
                }

                // Update item status
                await supabase
                    .from('marketplace_order_items')
                    .update({
                        provider_status: newStatus,
                        provider_start_count: providerStatus.start_count || null,
                        provider_remains: providerStatus.remains || 0,
                        status: newStatus === 'COMPLETED' ? 'COMPLETED' : newStatus === 'CANCELED' ? 'FAILED' : 'PROCESSING',
                    })
                    .eq('id', item.id);

                // ==========================================
                // 💸 AUTO-REFUND LOGIC
                // ==========================================
                let refundAmount = 0;

                if (newStatus === 'CANCELED' || newStatus === 'ERROR') {
                    // Full refund for canceled/error orders
                    refundAmount = item.subtotal;
                    console.log(`[SMM Monitor] ❌ Order canceled: Full refund Rp ${refundAmount}`);
                } else if (newStatus === 'PARTIAL') {
                    // Partial refund for incomplete orders
                    const remains = providerStatus.remains || 0;

                    if (remains > 0) {
                        // Calculate refund: (Remains ÷ 1000) × Price per 1K
                        const pricePerK = item.price_at_purchase || 0;
                        refundAmount = Math.floor((remains / 1000) * pricePerK);

                        console.log(`[SMM Monitor] ⚠️ Partial order: ${remains} units not delivered`);
                        console.log(`[SMM Monitor] Refund: (${remains} ÷ 1000) × ${pricePerK} = Rp ${refundAmount}`);
                    }
                }

                // Execute refund
                if (refundAmount > 0) {
                    const userId = (item.marketplace_orders as any).user_id;

                    console.log(`[SMM Monitor] 🔄 Refunding Rp ${refundAmount} to user ${userId}`);

                    const { error: refundError } = await supabase.rpc('add_balance', {
                        p_user_id: userId,
                        p_amount: refundAmount,
                    });

                    if (refundError) {
                        console.error(`[SMM Monitor] Refund failed:`, refundError);
                    } else {
                        console.log(`[SMM Monitor] ✅ Refund successful`);
                        refundedAmount += refundAmount;

                        // Update order item with refund info
                        await supabase
                            .from('marketplace_order_items')
                            .update({
                                provider_data: {
                                    ...item.provider_data,
                                    refunded: true,
                                    refund_amount: refundAmount,
                                    refund_date: new Date().toISOString(),
                                },
                            })
                            .eq('id', item.id);

                        // TODO: Send notification to user
                        /*
                        await sendWhatsAppNotification({
                          to: userPhone,
                          message: `Maaf, pesanan SMM Anda ${item.marketplace_orders.trx_id} ${
                            newStatus === 'CANCELED' ? 'dibatalkan' : 'hanya terkirim sebagian'
                          }. Refund Rp ${refundAmount.toLocaleString()} telah dikembalikan ke wallet Anda.`
                        });
                        */
                    }
                }

                processedCount++;
            } catch (itemError: any) {
                console.error(`[SMM Monitor] Error processing item ${item.id}:`, itemError.message);
            }
        }

        // ==========================================
        // 3. Return Summary
        // ==========================================
        console.log('[SMM Monitor] ✅ Monitoring completed', {
            checked: activeItems.length,
            processed: processedCount,
            completed: completedCount,
            partial: partialCount,
            canceled: canceledCount,
            total_refunded: refundedAmount,
        });

        return NextResponse.json({
            success: true,
            message: 'SMM monitoring completed',
            summary: {
                total_checked: activeItems.length,
                successfully_processed: processedCount,
                completed: completedCount,
                partial: partialCount,
                canceled: canceledCount,
                total_refunded: refundedAmount,
            },
        });
    } catch (error: any) {
        console.error('[SMM Monitor] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'SMM monitoring failed',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET endpoint for manual trigger
// ==========================================

export async function GET(req: Request) {
    // Same logic as POST
    return POST(req);
}
