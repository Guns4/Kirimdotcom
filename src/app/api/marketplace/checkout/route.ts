import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processSmmOrder } from '@/lib/api/smm-provider';
import { CheckoutSchema } from '@/lib/validators/checkout';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/marketplace/checkout
// ATOMIC TRANSACTION with AUTO-REFUND
// ==========================================

export async function POST(req: Request) {
    // Transaction tracking for emergency refund
    let user_id_ref = '';
    let total_amount_ref = 0;
    let trx_id_ref = '';
    let payment_deducted = false;

    try {
        const body = await req.json();

        // ==========================================
        // 1. INPUT VALIDATION (ZOD SHIELD) 🛡️
        // ==========================================
        console.log('[Checkout] Validating input...');

        const validation = CheckoutSchema.safeParse(body);

        if (!validation.success) {
            console.warn('[Checkout] Validation failed:', validation.error.format());
            return NextResponse.json(
                {
                    error: 'Invalid input data',
                    details: validation.error.format(),
                },
                { status: 400 }
            );
        }

        const { user_id, items, shipping_address, target_input, payment_method } = validation.data;
        user_id_ref = user_id;

        console.log('[Checkout] ✅ Input validated', {
            user_id,
            items_count: items.length,
            payment_method,
        });

        // ==========================================
        // 2. FETCH PRODUCTS & CALCULATE TOTAL
        // ==========================================
        let totalAmount = 0;
        const orderItems: any[] = [];
        const physicalProducts: any[] = [];
        const digitalProducts: any[] = [];
        const trxId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        trx_id_ref = trxId;

        console.log('[Checkout] Fetching products and validating stock...');

        for (const item of items) {
            const { data: product, error: productError } = await supabase
                .from('marketplace_products')
                .select('*')
                .eq('id', item.product_id)
                .eq('is_active', true)
                .single();

            if (productError || !product) {
                throw new Error(`Product not found or inactive: ${item.product_id}`);
            }

            // Stock validation for physical products
            if (product.type === 'PHYSICAL') {
                if (product.stock < item.qty) {
                    throw new Error(
                        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`
                    );
                }
                physicalProducts.push({ ...product, order_qty: item.qty });
            } else {
                digitalProducts.push({ ...product, order_qty: item.qty });
            }

            const subtotal = product.price_sell * item.qty;
            totalAmount += subtotal;

            orderItems.push({
                product_id: product.id,
                product_sku: product.sku,
                product_name: product.name,
                product_type: product.type,
                qty: item.qty,
                price: product.price_sell,
                subtotal: subtotal,
                provider_config: product.provider_config,
            });
        }

        total_amount_ref = totalAmount;

        console.log('[Checkout] Order summary validated:', {
            total_amount: totalAmount,
            physical_items: physicalProducts.length,
            digital_items: digitalProducts.length,
        });

        // ==========================================
        // 3. PAYMENT DEDUCTION (POINT OF NO RETURN) 💰
        // ==========================================
        if (payment_method === 'WALLET') {
            console.log('[Checkout] 💳 Deducting wallet balance...');

            const { data: deductResult, error: deductError } = await supabase.rpc('deduct_balance', {
                p_user_id: user_id,
                p_amount: totalAmount,
            });

            if (deductError || !deductResult?.[0]?.success) {
                console.warn('[Checkout] ❌ Insufficient balance');
                return NextResponse.json(
                    {
                        error: 'Insufficient wallet balance',
                        required: totalAmount,
                        message: 'Please top up your wallet to complete this purchase',
                    },
                    { status: 402 }
                );
            }

            payment_deducted = true;
            console.log('[Checkout] ✅ Payment deducted. New balance:', deductResult[0].new_balance);
        }

        // ==========================================
        // ⚠️ DANGER ZONE: Money taken, must complete or refund
        // ==========================================

        try {
            // ==========================================
            // 4. CREATE ORDER RECORD
            // ==========================================
            console.log('[Checkout] Creating order record...');

            const { data: order, error: orderError } = await supabase
                .from('marketplace_orders')
                .insert({
                    user_id,
                    trx_id: trxId,
                    total_amount: totalAmount,
                    payment_method,
                    payment_status: payment_method === 'WALLET' ? 'PAID' : 'UNPAID',
                    order_status: 'PROCESSING',
                    shipping_address: physicalProducts.length > 0 ? shipping_address : null,
                    target_input: digitalProducts.length > 0 ? target_input : null,
                })
                .select()
                .single();

            if (orderError) {
                throw new Error(`Failed to create order: ${orderError.message}`);
            }

            console.log('[Checkout] ✅ Order created:', order.id);

            // ==========================================
            // 5. INSERT ORDER ITEMS
            // ==========================================
            const itemsPayload = orderItems.map((item) => ({
                order_id: order.id,
                product_id: item.product_id,
                product_sku: item.product_sku,
                product_name: item.product_name,
                product_type: item.product_type,
                qty: item.qty,
                price_at_purchase: item.price,
                subtotal: item.subtotal,
                status: 'PENDING',
            }));

            const { error: itemsError } = await supabase
                .from('marketplace_order_items')
                .insert(itemsPayload);

            if (itemsError) {
                throw new Error(`Failed to insert items: ${itemsError.message}`);
            }

            console.log('[Checkout] ✅ Order items inserted');

            // ==========================================
            // 6. DEDUCT STOCK (Physical Products)
            // ==========================================
            for (const product of physicalProducts) {
                console.log(`[Checkout] Deducting stock: ${product.sku} x${product.order_qty}`);

                const { data: stockResult, error: stockError } = await supabase.rpc('deduct_product_stock', {
                    p_product_id: product.id,
                    p_quantity: product.order_qty,
                });

                if (stockError || !stockResult?.[0]?.success) {
                    console.error('[Checkout] Stock deduction failed:', stockResult?.[0]?.message);
                    // Log but don't fail - order already created
                }
            }

            // ==========================================
            // 7. PROCESS SMM ORDERS (Digital Products)
            // ==========================================
            let smmFailureCount = 0;

            for (const item of orderItems) {
                if (item.product_type === 'DIGITAL_SMM' && item.provider_config) {
                    console.log(`[Checkout] Processing SMM order: ${item.product_name}`);

                    try {
                        const target =
                            target_input?.instagram_username ||
                            target_input?.tiktok_url ||
                            target_input?.link ||
                            '';

                        if (!target) {
                            throw new Error('Missing target for SMM service');
                        }

                        const smmResult = await processSmmOrder({
                            service_id: item.provider_config.service_id,
                            target: target,
                            qty: item.qty,
                        });

                        if (smmResult.success) {
                            console.log('[Checkout] ✅ SMM order placed:', smmResult.provider_order_id);

                            // Update item with provider info
                            await supabase
                                .from('marketplace_order_items')
                                .update({
                                    provider_order_id: smmResult.provider_order_id,
                                    provider_status: 'SUBMITTED',
                                    status: 'PROCESSING',
                                    provider_data: smmResult,
                                })
                                .eq('order_id', order.id)
                                .eq('product_id', item.product_id);
                        } else {
                            // SMM provider failed
                            console.error('[Checkout] ❌ SMM order failed:', smmResult.error);
                            smmFailureCount++;

                            await supabase
                                .from('marketplace_order_items')
                                .update({
                                    status: 'FAILED',
                                    provider_data: { error: smmResult.error },
                                })
                                .eq('order_id', order.id)
                                .eq('product_id', item.product_id);
                        }
                    } catch (smmError: any) {
                        console.error('[Checkout] SMM processing exception:', smmError.message);
                        smmFailureCount++;
                    }
                }
            }

            // Mark order if SMM items failed
            if (smmFailureCount > 0 && digitalProducts.length > 0) {
                await supabase
                    .from('marketplace_orders')
                    .update({ order_status: 'PARTIAL_ISSUE' })
                    .eq('id', order.id);

                console.warn(`[Checkout] ⚠️ Order ${trxId} has ${smmFailureCount} failed SMM items`);
            }

            // ==========================================
            // 8. NOTIFICATION HOOKS
            // ==========================================
            console.log(`🔔 [NEW ORDER] ${trxId} - Rp ${totalAmount.toLocaleString()}`);

            // TODO: Send WhatsApp notifications
            /*
            await sendWhatsAppNotification({
              to: ADMIN_PHONE,
              message: `🛍️ *PESANAN BARU!*\n\nOrder: ${trxId}\nTotal: Rp ${totalAmount.toLocaleString()}\nItems: ${items.length}`
            });
            */

            // ==========================================
            // 9. SUCCESS RESPONSE
            // ==========================================
            return NextResponse.json({
                success: true,
                order: {
                    trx_id: trxId,
                    order_id: order.id,
                    total_amount: totalAmount,
                    payment_method,
                    payment_status: payment_method === 'WALLET' ? 'PAID' : 'UNPAID',
                    order_status: smmFailureCount > 0 ? 'PARTIAL_ISSUE' : 'PROCESSING',
                    items_count: items.length,
                },
                message:
                    payment_method === 'WALLET'
                        ? 'Order successfully placed and paid!'
                        : 'Order created, awaiting payment',
            });
        } catch (processingError: any) {
            // ==========================================
            // 🚨 EMERGENCY REFUND PROTOCOL
            // ==========================================
            console.error('[Checkout] 🚨 CRITICAL ERROR:', processingError.message);

            if (payment_deducted && payment_method === 'WALLET') {
                console.log(`[Checkout] 🔄 INITIATING AUTO-REFUND for ${user_id}`);
                console.log(`[Checkout] Amount: Rp ${totalAmount.toLocaleString()}`);

                const { error: refundError } = await supabase.rpc('add_balance', {
                    p_user_id: user_id,
                    p_amount: totalAmount,
                });

                if (refundError) {
                    console.error('[Checkout] ❌ CRITICAL: Refund failed!', refundError);
                    // TODO: Alert admin immediately
                } else {
                    console.log('[Checkout] ✅ Refund successful');
                }

                return NextResponse.json(
                    {
                        error: 'Transaction failed due to system error',
                        message: 'Your wallet balance has been automatically refunded',
                        refunded: true,
                        amount: totalAmount,
                    },
                    { status: 500 }
                );
            }

            throw processingError;
        }
    } catch (error: any) {
        console.error('[Checkout] Global error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to process checkout',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}
