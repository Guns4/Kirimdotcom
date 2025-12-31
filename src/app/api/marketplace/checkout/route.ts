import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// TypeScript Interfaces
// ==========================================

interface CheckoutItem {
    product_id: string;
    qty: number;
}

interface CheckoutRequest {
    user_id: string;
    items: CheckoutItem[];
    shipping_address?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        postal_code: string;
    };
    target_input?: {
        instagram_username?: string;
        tiktok_url?: string;
        link?: string;
    };
    payment_method: string; // WALLET, QRIS, VA_BCA, etc.
}

// ==========================================
// POST /api/marketplace/checkout
// Process marketplace order
// ==========================================

export async function POST(req: Request) {
    try {
        const body: CheckoutRequest = await req.json();
        const { user_id, items, shipping_address, target_input, payment_method } = body;

        console.log('[Marketplace Checkout] Processing order...', {
            user_id,
            items_count: items?.length,
            payment_method,
        });

        // 1. Validate Input
        if (!user_id || !items || items.length === 0 || !payment_method) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, items, payment_method' },
                { status: 400 }
            );
        }

        // 2. Fetch Products & Calculate Total
        let totalAmount = 0;
        const orderItems: any[] = [];
        const physicalProducts: any[] = [];
        const digitalProducts: any[] = [];

        for (const item of items) {
            const { data: product, error: productError } = await supabase
                .from('marketplace_products')
                .select('*')
                .eq('id', item.product_id)
                .eq('is_active', true)
                .single();

            if (productError || !product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            // 3. Check Stock for Physical Products
            if (product.type === 'PHYSICAL') {
                if (product.stock < item.qty) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`);
                }
                physicalProducts.push({ ...product, order_qty: item.qty });
            } else {
                digitalProducts.push({ ...product, order_qty: item.qty });
            }

            // Calculate subtotal
            const subtotal = product.price_sell * item.qty;
            totalAmount += subtotal;

            orderItems.push({
                product_id: product.id,
                product_sku: product.sku,
                product_name: product.name,
                product_type: product.type,
                qty: item.qty,
                price_at_purchase: product.price_sell,
                subtotal: subtotal,
            });
        }

        console.log('[Marketplace Checkout] Order summary:', {
            total_amount: totalAmount,
            physical_items: physicalProducts.length,
            digital_items: digitalProducts.length,
        });

        // 4. Generate Transaction ID
        const trxId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        // 5. Process Payment
        let paymentStatus = 'UNPAID';
        let orderStatus = 'PENDING';

        if (payment_method === 'WALLET') {
            console.log('[Marketplace Checkout] Processing wallet payment...');

            // Deduct balance from user wallet
            const { data: deductResult, error: deductError } = await supabase.rpc(
                'deduct_balance',
                {
                    p_user_id: user_id,
                    p_amount: totalAmount,
                }
            );

            if (deductError || !deductResult?.[0]?.success) {
                throw new Error(
                    deductResult?.[0]?.message || 'Insufficient wallet balance'
                );
            }

            console.log('[Marketplace Checkout] Wallet payment successful. New balance:', deductResult[0].new_balance);

            paymentStatus = 'PAID';
            orderStatus = 'PROCESSING';
        } else {
            // For other payment methods (QRIS, VA), status remains UNPAID
            // Actual payment processing would happen via webhook
            console.log(`[Marketplace Checkout] Payment method ${payment_method} requires external processing`);
        }

        // 6. Create Order Record
        const { data: order, error: orderError } = await supabase
            .from('marketplace_orders')
            .insert({
                user_id,
                trx_id: trxId,
                total_amount: totalAmount,
                payment_method,
                payment_status: paymentStatus,
                order_status: orderStatus,
                shipping_address: physicalProducts.length > 0 ? shipping_address : null,
                target_input: digitalProducts.length > 0 ? target_input : null,
            })
            .select()
            .single();

        if (orderError) {
            // Refund wallet if order creation fails
            if (payment_method === 'WALLET' && paymentStatus === 'PAID') {
                await supabase.rpc('add_balance', {
                    p_user_id: user_id,
                    p_amount: totalAmount,
                });
            }
            throw new Error('Failed to create order: ' + orderError.message);
        }

        console.log('[Marketplace Checkout] Order created:', order.id);

        // 7. Insert Order Items
        const itemsPayload = orderItems.map((item) => ({
            ...item,
            order_id: order.id,
        }));

        const { error: itemsError } = await supabase
            .from('marketplace_order_items')
            .insert(itemsPayload);

        if (itemsError) {
            console.error('[Marketplace Checkout] Failed to insert items:', itemsError);
            // Don't fail the order, just log the error
        }

        // 8. Deduct Stock for Physical Products
        for (const product of physicalProducts) {
            console.log(`[Marketplace Checkout] Deducting stock for ${product.sku}: ${product.order_qty} units`);

            const { data: stockResult, error: stockError } = await supabase.rpc(
                'deduct_product_stock',
                {
                    p_product_id: product.id,
                    p_quantity: product.order_qty,
                }
            );

            if (stockError || !stockResult?.[0]?.success) {
                console.error('[Marketplace Checkout] Stock deduction failed:', stockResult?.[0]?.message);
                // Log but don't fail - order is already created
            } else {
                console.log(`[Marketplace Checkout] Stock deducted. New stock: ${stockResult[0].new_stock}`);
            }
        }

        // 9. Process SMM Orders (Digital Products)
        if (digitalProducts.length > 0) {
            console.log('[Marketplace Checkout] Processing SMM orders...');

            // TODO: Integrate with SMM provider API (MedanPedia, IrvanKede, etc.)
            // For now, we'll just log the items
            for (const product of digitalProducts) {
                console.log(`[Marketplace Checkout] SMM Product: ${product.name}`, {
                    quantity: product.order_qty,
                    target: target_input,
                    provider_config: product.provider_config,
                });

                // Placeholder for SMM API call
                // const smmResult = await callSmmProvider({
                //   service_id: product.provider_config.service_id,
                //   quantity: product.order_qty,
                //   link: target_input?.instagram_username || target_input?.link
                // });
            }
        }

        // 10. Success Response
        return NextResponse.json({
            success: true,
            order: {
                trx_id: trxId,
                order_id: order.id,
                total_amount: totalAmount,
                payment_method,
                payment_status: paymentStatus,
                order_status: orderStatus,
                items_count: items.length,
            },
            message: paymentStatus === 'PAID'
                ? 'Order successfully placed and paid'
                : 'Order created, awaiting payment',
        });

    } catch (error: any) {
        console.error('[Marketplace Checkout] Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to process checkout',
                details: error.toString(),
            },
            { status: 400 }
        );
    }
}
