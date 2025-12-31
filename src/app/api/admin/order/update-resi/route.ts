import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/admin/order/update-resi
// SECURED: Requires admin secret header
// ==========================================

interface UpdateResiRequest {
    order_id: string;
    resi_number: string;
    courier_name: string;
    notes?: string;
}

export async function POST(req: Request) {
    try {
        // ==========================================
        // 🔒 SECURITY CHECK #1: Admin Secret Header
        // ==========================================
        const adminSecret = req.headers.get('x-admin-secret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
            console.warn('[Admin Update Resi] Unauthorized access attempt');
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Invalid or missing admin credentials. Access denied.'
                },
                { status: 401 }
            );
        }

        console.log('[Admin Update Resi] ✅ Admin authenticated');

        const body: UpdateResiRequest = await req.json();
        const { order_id, resi_number, courier_name, notes } = body;

        console.log('[Admin Update Resi] Processing...', {
            order_id,
            resi_number,
            courier_name,
        });

        // Validate Input
        if (!order_id || !resi_number || !courier_name) {
            return NextResponse.json(
                { error: 'Missing required fields: order_id, resi_number, courier_name' },
                { status: 400 }
            );
        }

        // Fetch order to verify it exists
        const { data: order, error: fetchError } = await supabase
            .from('marketplace_orders')
            .select('*, marketplace_order_items(*)')
            .eq('id', order_id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order has physical items
        const hasPhysicalItems = order.marketplace_order_items?.some(
            (item: any) => item.product_type === 'PHYSICAL'
        );

        if (!hasPhysicalItems) {
            return NextResponse.json(
                { error: 'This order does not contain physical products that require shipping' },
                { status: 400 }
            );
        }

        // Update order with tracking info
        const { data: updatedOrder, error: updateError } = await supabase
            .from('marketplace_orders')
            .update({
                tracking_number: resi_number,
                courier_used: courier_name,
                order_status: 'SHIPPED',
                shipped_at: new Date().toISOString(),
                notes: notes || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', order_id)
            .select()
            .single();

        if (updateError) {
            console.error('[Admin Update Resi] Update failed:', updateError);
            throw updateError;
        }

        console.log('[Admin Update Resi] ✅ Order updated:', updatedOrder.trx_id);

        // ==========================================
        // 📱 TODO: Send notification to user
        // ==========================================
        // Example WhatsApp notification:
        /*
        const message = `
          Halo! Pesanan Anda ${updatedOrder.trx_id} telah dikirim!
          
          Kurir: ${courier_name.toUpperCase()}
          No. Resi: ${resi_number}
          
          Lacak paket Anda di: [link]
        `;
        
        await sendWhatsAppNotification(order.user_id, message);
        */

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Tracking number updated successfully. Order marked as SHIPPED.',
            order: {
                id: updatedOrder.id,
                trx_id: updatedOrder.trx_id,
                tracking_number: updatedOrder.tracking_number,
                courier_used: updatedOrder.courier_used,
                order_status: updatedOrder.order_status,
                shipped_at: updatedOrder.shipped_at,
            },
        });

    } catch (error: any) {
        console.error('[Admin Update Resi] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update tracking number',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET /api/admin/order/update-resi
// Get pending shipments (SECURED)
// ==========================================

export async function GET(req: Request) {
    try {
        // ==========================================
        // 🔒 SECURITY CHECK: Admin Secret Header
        // ==========================================
        const adminSecret = req.headers.get('x-admin-secret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
            console.warn('[Admin Get Pending] Unauthorized access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch orders that need shipping
        const { data: orders, error } = await supabase
            .from('marketplace_orders')
            .select('*, marketplace_order_items(*)')
            .eq('payment_status', 'PAID')
            .in('order_status', ['PROCESSING', 'PENDING'])
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Filter orders with physical items
        const physicalOrders = orders?.filter((order: any) =>
            order.marketplace_order_items?.some((item: any) => item.product_type === 'PHYSICAL')
        ) || [];

        return NextResponse.json({
            success: true,
            pending_shipments: physicalOrders.map((order: any) => ({
                id: order.id,
                trx_id: order.trx_id,
                created_at: order.created_at,
                total_amount: order.total_amount,
                shipping_address: order.shipping_address,
                items: order.marketplace_order_items.filter((item: any) => item.product_type === 'PHYSICAL'),
                items_count: order.marketplace_order_items.filter((item: any) => item.product_type === 'PHYSICAL').length,
            })),
            count: physicalOrders.length,
        });

    } catch (error: any) {
        console.error('[Admin Get Pending] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending shipments', details: error.message },
            { status: 500 }
        );
    }
}
