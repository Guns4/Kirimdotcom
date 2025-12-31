import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/admin/wallet/process-withdraw
// Approve or reject withdrawal request
// ==========================================

export async function POST(req: Request) {
    try {
        // Security check
        const secret = req.headers.get('x-admin-secret');
        if (secret !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trx_id, action, admin_note } = await req.json();

        if (!trx_id || !action) {
            return NextResponse.json(
                { error: 'trx_id and action are required' },
                { status: 400 }
            );
        }

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json(
                { error: 'action must be APPROVE or REJECT' },
                { status: 400 }
            );
        }

        // Get withdrawal request
        const { data: withdrawal, error: fetchError } = await supabase
            .from('wallet_withdrawals')
            .select('*')
            .eq('trx_id', trx_id)
            .single();

        if (fetchError || !withdrawal) {
            return NextResponse.json(
                { error: 'Withdrawal request not found' },
                { status: 404 }
            );
        }

        if (withdrawal.status !== 'PENDING') {
            return NextResponse.json(
                { error: `Request already ${withdrawal.status}` },
                { status: 400 }
            );
        }

        console.log(`[Admin] Processing withdrawal ${trx_id}: ${action}`);

        // ==========================================
        // Process based on action
        // ==========================================

        if (action === 'APPROVE') {
            // Update status to approved
            const { error: updateError } = await supabase
                .from('wallet_withdrawals')
                .update({
                    status: 'APPROVED',
                    admin_note: admin_note || 'Approved and transferred',
                    updated_at: new Date().toISOString(),
                })
                .eq('trx_id', trx_id);

            if (updateError) {
                throw updateError;
            }

            console.log(`[Admin] ✅ Withdrawal APPROVED: ${trx_id}`);

            // TODO: Send notification to user
            /*
            await sendWhatsAppNotification({
              to: userPhone,
              message: `Penarikan dana Rp ${withdrawal.amount.toLocaleString()} telah disetujui dan ditransfer ke rekening Anda.`
            });
            */

            return NextResponse.json({
                success: true,
                message: 'Withdrawal approved successfully',
                action: 'APPROVED',
            });
        } else if (action === 'REJECT') {
            // ==========================================
            // 💸 REFUND BALANCE (User gets money back)
            // ==========================================
            console.log(`[Admin] Refunding balance: Rp ${withdrawal.amount}`);

            const { error: refundError } = await supabase.rpc('add_balance', {
                p_user_id: withdrawal.user_id,
                p_amount: withdrawal.amount,
            });

            if (refundError) {
                console.error('[Admin] Refund error:', refundError);
                throw new Error('Failed to refund balance');
            }

            // Update status to rejected
            const { error: updateError } = await supabase
                .from('wallet_withdrawals')
                .update({
                    status: 'REJECTED',
                    admin_note: admin_note || 'Rejected by admin',
                    updated_at: new Date().toISOString(),
                })
                .eq('trx_id', trx_id);

            if (updateError) {
                throw updateError;
            }

            console.log(`[Admin] ❌ Withdrawal REJECTED & REFUNDED: ${trx_id}`);

            // TODO: Send notification to user
            /*
            await sendWhatsAppNotification({
              to: userPhone,
              message: `Penarikan dana Rp ${withdrawal.amount.toLocaleString()} ditolak. Saldo telah dikembalikan ke wallet Anda. Alasan: ${admin_note}`
            });
            */

            return NextResponse.json({
                success: true,
                message: 'Withdrawal rejected and balance refunded',
                action: 'REJECTED',
                refunded_amount: withdrawal.amount,
            });
        }
    } catch (error: any) {
        console.error('[Admin] Process withdraw error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process withdrawal',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
