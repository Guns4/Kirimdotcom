import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/wallet/withdraw
// Create withdrawal request with PIN verification
// ==========================================

export async function POST(req: Request) {
    try {
        const { user_id, amount, bank_name, account_number, account_holder, pin } = await req.json();

        // Validation
        if (!user_id || !amount || !bank_name || !account_number || !account_holder || !pin) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (amount < 50000) {
            return NextResponse.json(
                { error: 'Minimum withdrawal amount is Rp 50,000' },
                { status: 400 }
            );
        }

        // ==========================================
        // 🔒 SECURITY: Check PIN & Lock Status
        // ==========================================
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('transaction_pin, failed_pin_attempts, pin_locked_until, wallet_balance')
            .eq('id', user_id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if account is locked
        if (user.pin_locked_until && new Date(user.pin_locked_until) > new Date()) {
            const lockTime = new Date(user.pin_locked_until);
            const minutesLeft = Math.ceil((lockTime.getTime() - Date.now()) / 60000);
            return NextResponse.json(
                {
                    error: `Account locked due to failed PIN attempts. Try again in ${minutesLeft} minutes.`,
                },
                { status: 429 }
            );
        }

        // Check if PIN is set
        if (!user.transaction_pin) {
            return NextResponse.json(
                { error: 'Transaction PIN not set. Please set PIN first.' },
                { status: 400 }
            );
        }

        // ==========================================
        // 🔐 VERIFY PIN with Anti-Brute Force
        // ==========================================
        const isPinValid = await bcrypt.compare(pin, user.transaction_pin);

        if (!isPinValid) {
            // Increment failed attempts
            const newAttempts = (user.failed_pin_attempts || 0) + 1;
            const updateData: any = { failed_pin_attempts: newAttempts };

            // Lock after 3 failed attempts (30 minutes)
            if (newAttempts >= 3) {
                const lockTime = new Date();
                lockTime.setMinutes(lockTime.getMinutes() + 30);
                updateData.pin_locked_until = lockTime.toISOString();
                updateData.failed_pin_attempts = 0; // Reset counter
            }

            await supabase.from('users').update(updateData).eq('id', user_id);

            if (newAttempts >= 3) {
                console.log('[Withdraw] ⛔ Account locked after 3 failed PIN attempts');
                return NextResponse.json(
                    { error: 'Incorrect PIN 3 times. Account locked for 30 minutes.' },
                    { status: 403 }
                );
            }

            console.log('[Withdraw] ❌ Incorrect PIN. Attempts:', newAttempts);
            return NextResponse.json(
                {
                    error: `Incorrect PIN. ${3 - newAttempts} attempts remaining.`,
                    attempts_remaining: 3 - newAttempts,
                },
                { status: 403 }
            );
        }

        // Reset failed attempts on successful PIN
        if (user.failed_pin_attempts > 0) {
            await supabase
                .from('users')
                .update({
                    failed_pin_attempts: 0,
                    pin_locked_until: null,
                })
                .eq('id', user_id);
        }

        console.log('[Withdraw] ✅ PIN verified');

        // ==========================================
        // 💰 DEDUCT BALANCE (ATOMIC)
        // ==========================================
        const trxId = `WD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        console.log('[Withdraw] 💸 Deducting balance:', amount);

        const { error: deductError } = await supabase.rpc('deduct_balance', {
            p_user_id: user_id,
            p_amount: amount,
        });

        if (deductError) {
            console.error('[Withdraw] ❌ Insufficient balance');
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 402 }
            );
        }

        console.log('[Withdraw] ✅ Balance deducted');

        // ==========================================
        // 📝 CREATE WITHDRAWAL REQUEST
        // ==========================================
        try {
            const { error: insertError } = await supabase.from('wallet_withdrawals').insert({
                user_id,
                trx_id: trxId,
                amount,
                bank_name,
                account_number,
                account_holder,
                status: 'PENDING',
            });

            if (insertError) {
                // ==========================================
                // 🚨 ROLLBACK: Refund balance on DB error
                // ==========================================
                console.error('[Withdraw] Database insert failed. Initiating rollback...');

                await supabase.rpc('add_balance', {
                    p_user_id: user_id,
                    p_amount: amount,
                });

                console.log('[Withdraw] ✅ Balance refunded (rollback)');
                throw new Error('Database error. Balance has been refunded.');
            }

            console.log('[Withdraw] ✅ Withdrawal request created:', trxId);

            // TODO: Send notification to admin
            /*
            await sendAdminNotification({
              message: `New withdrawal request: Rp ${amount.toLocaleString()} to ${bank_name}`
            });
            */

            return NextResponse.json({
                success: true,
                trx_id: trxId,
                message: 'Withdrawal request submitted. Pending admin approval.',
            });
        } catch (insertError: any) {
            console.error('[Withdraw] Fatal error:', insertError);
            throw insertError;
        }
    } catch (error: any) {
        console.error('[Withdraw] Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to process withdrawal',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET /api/wallet/withdraw
// Get user's withdrawal history
// ==========================================

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('wallet_withdrawals')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            withdrawals: data,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Failed to fetch withdrawal history',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
