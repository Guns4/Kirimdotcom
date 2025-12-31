import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processSmmOrder } from '@/lib/api/smm-provider';

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
    payment_method: string;
}

// ==========================================
// POST /api/marketplace/checkout
// Enhanced with SMM Provider Integration
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
                provider_config: product.provider_config, // SMM provider config
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

        // 7. Process Order Items & SMM Integration
        const itemsPayload: any[] = [];

        for (const item of orderItems) {
            const itemPayload: any = {
                order_id: order.id,
                product_id: item.product_id,
                product_sku: item.product_sku,
                product_name: item.product_name,
                product_type: item.product_type,
                qty: item.qty,
                price_at_purchase: item.price_at_purchase,
                subtotal: item.subtotal,
                status: 'PENDING',
            };

            // ==========================================
            // 🚀 AUTO SMM ORDER PROCESSING
            // ==========================================
            if (item.product_type === 'DIGITAL_SMM' && item.provider_config) {
                console.log(`[Marketplace Checkout] Processing SMM order for: ${item.product_name}`);

                try {
                    // Extract target (username or URL)
                    const target = target_input?.instagram_username ||
                        target_input?.tiktok_url ||
                        target_input?.link ||
                        '';

                    if (!target) {
                        throw new Error('Missing target input for SMM service');
                    }

                    // Send order to SMM provider
                    const smmResult = await processSmmOrder({
                        service_id: item.provider_config.service_id,
                        target: target,
                        qty: item.qty,
                    });

                    if (smmResult.success) {
                        console.log('[Marketplace Checkout] ✅ SMM order placed:', smmResult.provider_order_id);

                        // Update item with provider info
                        itemPayload.status = 'PROCESSING';
                        itemPayload.provider_data = {
                            provider_order_id: smmResult.provider_order_id,
                            start_count: smmResult.start_count,
                            remains: smmResult.remains,
                            note: smmResult.note,
                            processed_at: new Date().toISOString(),
                        };

                        // Update main order with provider info
                        await supabase
                            .from('marketplace_orders')
                            .update({
                                provider_order_id: smmResult.provider_order_id,
                                provider_response: smmResult,
                            })
                            .eq('id', order.id);

                    } else {
                        // SMM order failed
                        console.error('[Marketplace Checkout] ❌ SMM order failed:', smmResult.error);

                        itemPayload.status = 'FAILED';
                        itemPayload.provider_data = {
                            error: smmResult.error,
                            failed_at: new Date().toISOString(),
                        };

                        // Log for manual processing
                        // TODO: Send alert to admin
                    }

                } catch (smmError: any) {
                    console.error('[Marketplace Checkout] SMM processing exception:', smmError.message);

                    itemPayload.status = 'FAILED';
                    itemPayload.provider_data = {
                        error: smmError.message,
                        failed_at: new Date().toISOString(),
                    };
                }
            }

            itemsPayload.push(itemPayload);

            // ==========================================
            // 📦 DEDUCT STOCK (Physical Products Only)
            // ==========================================
            if (item.product_type === 'PHYSICAL') {
                console.log(`[Marketplace Checkout] Deducting stock for ${item.product_sku}: ${item.qty} units`);

                const { data: stockResult, error: stockError } = await supabase.rpc(
                    'deduct_product_stock',
                    {
                        p_product_id: item.product_id,
                        p_quantity: item.qty,
                    }
                );

                if (stockError || !stockResult?.[0]?.success) {
                    console.error('[Marketplace Checkout] Stock deduction failed:', stockResult?.[0]?.message);
                } else {
                    console.log(`[Marketplace Checkout] Stock deducted. New stock: ${stockResult[0].new_stock}`);
                }
            }
        }

        // 8. Insert Order Items
        const { error: itemsError } = await supabase
            .from('marketplace_order_items')
            .insert(itemsPayload);

        if (itemsError) {
            console.error('[Marketplace Checkout] Failed to insert items:', itemsError);
        }

        // 9. Update Order Status
        // If all digital items are processed, mark as completed
        const allDigitalProcessed = digitalProducts.length > 0 &&
            itemsPayload.filter(i => i.product_type === 'DIGITAL_SMM' && i.status === 'PROCESSING').length === digitalProducts.length;

        if (allDigitalProcessed && physicalProducts.length === 0) {
            await supabase
                .from('marketplace_orders')
                .update({
                    order_status: 'COMPLETED',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', order.id);
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
                order_status: allDigitalProcessed && physicalProducts.length === 0 ? 'COMPLETED' : orderStatus,
                items_count: items.length,
                digital_items: digitalProducts.length,
                physical_items: physicalProducts.length,
            },
            message: paymentStatus === 'PAID'
                ? digitalProducts.length > 0
                    ? 'Order successfully placed! Digital services are being processed automatically.'
                    : 'Order successfully placed and paid'
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
