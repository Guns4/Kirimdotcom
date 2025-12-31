import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/webhook/midtrans
// Handle payment notifications from Midtrans
// ==========================================

export async function POST(req: Request) {
    try {
        const notification = await req.json();

        console.log('[Midtrans Webhook] Received notification:', notification.order_id);

        // ==========================================
        // 🔒 SECURITY: Verify signature (CRITICAL!)
        // ==========================================
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const input =
            notification.order_id + notification.status_code + notification.gross_amount + serverKey;
        const signature = crypto.createHash('sha512').update(input).digest('hex');

        if (signature !== notification.signature_key) {
            console.error('[Midtrans Webhook] ⛔ INVALID SIGNATURE DETECTED');
            console.error('[Midtrans Webhook] Expected:', signature);
            console.error('[Midtrans Webhook] Received:', notification.signature_key);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        console.log('[Midtrans Webhook] ✅ Signature verified');

        // ==========================================
        // Determine transaction status
        // ==========================================
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const orderId = notification.order_id;
        const paymentType = notification.payment_type;

        let status = 'PENDING';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                status = 'PENDING'; // Review required
            } else if (fraudStatus === 'accept') {
                status = 'PAID';
            }
        } else if (transactionStatus === 'settlement') {
            status = 'PAID';
        } else if (
            transactionStatus === 'cancel' ||
            transactionStatus === 'deny' ||
            transactionStatus === 'expire'
        ) {
            status = 'FAILED';
        } else if (transactionStatus === 'pending') {
            status = 'PENDING';
        }

        console.log('[Midtrans Webhook] Status:', transactionStatus, '→', status);

        // ==========================================
        // Process based on status
        // ==========================================

        if (status === 'PAID') {
            // Get topup record
            const { data: topup, error: fetchError } = await supabase
                .from('wallet_topups')
                .select('*')
                .eq('trx_id', orderId)
                .single();

            if (fetchError || !topup) {
                console.error('[Midtrans Webhook] Topup not found:', orderId);
                return NextResponse.json(
                    { error: 'Transaction not found' },
                    { status: 404 }
                );
            }

            // ==========================================
            // 🛡️ IDEMPOTENCY CHECK (Prevent double topup)
            // ==========================================
            if (topup.status === 'PAID') {
                console.log('[Midtrans Webhook] ⚠️ Already processed, skipping');
                return NextResponse.json({ status: 'OK', message: 'Already processed' });
            }

            // Update topup status
            const { error: updateError } = await supabase
                .from('wallet_topups')
                .update({
                    status: 'PAID',
                    payment_type: paymentType,
                    updated_at: new Date().toISOString(),
                })
                .eq('trx_id', orderId);

            if (updateError) {
                console.error('[Midtrans Webhook] Update error:', updateError);
                throw updateError;
            }

            // ==========================================
            // 💰 ADD BALANCE (ATOMIC)
            // ==========================================
            console.log('[Midtrans Webhook] 💳 Adding balance:', topup.amount);

            const { error: balanceError } = await supabase.rpc('add_balance', {
                p_user_id: topup.user_id,
                p_amount: topup.amount,
            });

            if (balanceError) {
                console.error('[Midtrans Webhook] Balance add error:', balanceError);
                throw balanceError;
            }

            console.log('[Midtrans Webhook] ✅ Balance added successfully');

            // TODO: Send notification to user
            /*
            await sendWhatsAppNotification({
              to: userPhone,
              message: `Topup berhasil! Saldo Rp ${topup.amount.toLocaleString()} telah masuk ke wallet Anda.`
            });
            */
        } else if (status === 'FAILED') {
            // Update status to failed
            await supabase
                .from('wallet_topups')
                .update({
                    status: 'FAILED',
                    updated_at: new Date().toISOString(),
                })
                .eq('trx_id', orderId);

            console.log('[Midtrans Webhook] ❌ Payment failed/canceled');
        }

        return NextResponse.json({
            status: 'OK',
            message: 'Notification processed',
        });
    } catch (error: any) {
        console.error('[Midtrans Webhook] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'Webhook processing failed',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET endpoint for testing
// ==========================================

export async function GET() {
    return NextResponse.json({
        message: 'Midtrans webhook endpoint',
        status: 'active',
    });
}
