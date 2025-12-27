import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Midtrans Payment Webhook Handler
 * Handles payment notifications from Midtrans
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const payload = await req.json();

        // Log webhook
        await supabase.from('webhook_logs').insert({
            source: 'midtrans',
            payload,
            status: 'received',
        });

        // Verify signature (IMPORTANT for security)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const signatureKey = payload.signature_key;
        const orderId = payload.order_id;
        const statusCode = payload.status_code;
        const grossAmount = payload.gross_amount;

        const hash = crypto
            .createHash('sha512')
            .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
            .digest('hex');

        if (hash !== signatureKey) {
            console.error('Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Get transaction from database
        const { data: transaction } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Process based on transaction status
        const transactionStatus = payload.transaction_status;
        const fraudStatus = payload.fraud_status;

        let newStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                newStatus = 'success';
            }
        } else if (transactionStatus === 'settlement') {
            newStatus = 'success';
        } else if (
            transactionStatus === 'cancel' ||
            transactionStatus === 'deny' ||
            transactionStatus === 'expire'
        ) {
            newStatus = 'failed';
        }

        // Update payment status
        await supabase.rpc('update_payment_status', {
            p_order_id: orderId,
            p_status: newStatus,
            p_payment_method: payload.payment_type,
            p_transaction_id: payload.transaction_id,
        });

        // Auto-fulfill if success
        if (newStatus === 'success' && !transaction.is_fulfilled) {
            await autoFulfillOrder(transaction);
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

/**
 * Auto-fulfill order based on type
 */
async function autoFulfillOrder(transaction: any) {
    const supabase = await createClient();

    try {
        if (transaction.order_type === 'ppob' || transaction.order_type === 'pulsa') {
            // Process PPOB order
            await processPPOBOrder(transaction);
        } else if (transaction.order_type === 'ebook') {
            // Grant ebook access
            await grantEbookAccess(transaction);
        } else if (transaction.order_type === 'subscription') {
            // Activate subscription
            await activateSubscription(transaction);
        }

        // Mark as fulfilled
        await supabase
            .from('payment_transactions')
            .update({
                is_fulfilled: true,
                fulfilled_at: new Date().toISOString(),
            })
            .eq('id', transaction.id);
    } catch (error) {
        console.error('Fulfillment error:', error);

        // Log error
        await supabase
            .from('payment_transactions')
            .update({
                fulfillment_error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', transaction.id);
    }
}

/**
 * Process PPOB order via provider API
 */
async function processPPOBOrder(transaction: any) {
    const supabase = await createClient();

    // Get PPOB order details
    const { data: ppobOrder } = await supabase
        .from('ppob_orders')
        .select('*')
        .eq('payment_id', transaction.id)
        .single();

    if (!ppobOrder) {
        throw new Error('PPOB order not found');
    }

    // Call PPOB provider API (example: DigiFlazz)
    const apiKey = process.env.DIGIFLAZZ_API_KEY || '';
    const username = process.env.DIGIFLAZZ_USERNAME || '';

    const refId = `TRX-${Date.now()}`;
    const sign = crypto
        .createHash('md5')
        .update(username + apiKey + refId)
        .digest('hex');

    const response = await fetch('https://api.digiflazz.com/v1/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            buyer_sku_code: ppobOrder.product_code,
            customer_no: ppobOrder.destination,
            ref_id: refId,
            sign,
        }),
    });

    const result = await response.json();

    // Update PPOB order
    await supabase
        .from('ppob_orders')
        .update({
            status: result.data.status === 'Sukses' ? 'success' : 'failed',
            ref_id: result.data.ref_id,
            sn: result.data.sn,
            completed_at: new Date().toISOString(),
        })
        .eq('id', ppobOrder.id);

    if (result.data.status !== 'Sukses') {
        throw new Error(`PPOB failed: ${result.data.message}`);
    }
}

/**
 * Grant ebook access
 */
async function grantEbookAccess(transaction: any) {
    const supabase = await createClient();

    const productData = transaction.product_data;

    await supabase.from('digital_purchases').insert({
        user_id: transaction.user_id,
        product_id: productData.product_id,
        status: 'completed',
    });
}

/**
 * Activate subscription
 */
async function activateSubscription(transaction: any) {
    const supabase = await createClient();

    const productData = transaction.product_data;

    await supabase.rpc('upsert_user_subscription', {
        p_user_id: transaction.user_id,
        p_plan_code: productData.plan_code,
        p_billing_cycle: productData.billing_cycle,
        p_price_paid: transaction.gross_amount,
    });
}
