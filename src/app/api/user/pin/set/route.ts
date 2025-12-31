import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/user/pin/set
// Set or update transaction PIN
// ==========================================

export async function POST(req: Request) {
    try {
        const { user_id, pin, current_pin } = await req.json();

        // Validation
        if (!user_id || !pin) {
            return NextResponse.json(
                { error: 'user_id and pin are required' },
                { status: 400 }
            );
        }

        if (!/^\d{6}$/.test(pin)) {
            return NextResponse.json(
                { error: 'PIN must be exactly 6 digits' },
                { status: 400 }
            );
        }

        // Get current user data
        const { data: user } = await supabase
            .from('users')
            .select('transaction_pin')
            .eq('id', user_id)
            .single();

        // If PIN already exists, verify current PIN first
        if (user?.transaction_pin && current_pin) {
            const isValid = await bcrypt.compare(current_pin, user.transaction_pin);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Current PIN is incorrect' },
                    { status: 403 }
                );
            }
        }

        // Hash new PIN
        const hashedPin = await bcrypt.hash(pin, 10);

        // Update PIN
        const { error } = await supabase
            .from('users')
            .update({
                transaction_pin: hashedPin,
                failed_pin_attempts: 0,
                pin_locked_until: null,
            })
            .eq('id', user_id);

        if (error) {
            throw error;
        }

        console.log('[PIN] ✅ PIN updated for user:', user_id);

        return NextResponse.json({
            success: true,
            message: 'Transaction PIN set successfully',
        });
    } catch (error: any) {
        console.error('[PIN] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to set PIN',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// POST /api/user/pin/verify
// Verify transaction PIN
// ==========================================

export async function PATCH(req: Request) {
    try {
        const { user_id, pin } = await req.json();

        if (!user_id || !pin) {
            return NextResponse.json(
                { error: 'user_id and pin are required' },
                { status: 400 }
            );
        }

        // Get user data
        const { data: user } = await supabase
            .from('users')
            .select('transaction_pin, failed_pin_attempts, pin_locked_until')
            .eq('id', user_id)
            .single();

        if (!user || !user.transaction_pin) {
            return NextResponse.json(
                { error: 'PIN not set. Please set PIN first.' },
                { status: 400 }
            );
        }

        // Check if locked
        if (user.pin_locked_until && new Date(user.pin_locked_until) > new Date()) {
            const lockTime = new Date(user.pin_locked_until);
            return NextResponse.json(
                {
                    error: 'Account locked due to multiple failed attempts',
                    locked_until: lockTime.toISOString(),
                },
                { status: 429 }
            );
        }

        // Verify PIN
        const isValid = await bcrypt.compare(pin, user.transaction_pin);

        if (isValid) {
            // Reset failed attempts
            if (user.failed_pin_attempts > 0) {
                await supabase
                    .from('users')
                    .update({
                        failed_pin_attempts: 0,
                        pin_locked_until: null,
                    })
                    .eq('id', user_id);
            }

            return NextResponse.json({
                success: true,
                valid: true,
            });
        } else {
            // Increment failed attempts
            const newAttempts = (user.failed_pin_attempts || 0) + 1;
            const updateData: any = {
                failed_pin_attempts: newAttempts,
            };

            // Lock after 3 failed attempts
            if (newAttempts >= 3) {
                const lockTime = new Date();
                lockTime.setMinutes(lockTime.getMinutes() + 30);
                updateData.pin_locked_until = lockTime.toISOString();
                updateData.failed_pin_attempts = 0; // Reset for next cycle
            }

            await supabase.from('users').update(updateData).eq('id', user_id);

            if (newAttempts >= 3) {
                return NextResponse.json(
                    {
                        error: 'PIN incorrect 3 times. Account locked for 30 minutes.',
                        valid: false,
                    },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                {
                    error: `Incorrect PIN. ${3 - newAttempts} attempts remaining.`,
                    valid: false,
                    attempts_remaining: 3 - newAttempts,
                },
                { status: 403 }
            );
        }
    } catch (error: any) {
        console.error('[PIN] Verify error:', error);
        return NextResponse.json(
            {
                error: 'Failed to verify PIN',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
