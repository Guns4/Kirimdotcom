import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { product_code, amount, customer_no } = await request.json();

        if (!product_code || !amount || !customer_no) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // Get User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check & Deduct Balance (Atomic)
        const { data: deductResult, error: deductError } = await supabase
            .rpc('deduct_balance', {
                p_user_id: user.id,
                p_amount: amount
            });

        if (deductError) {
            console.error('Balance deduction failed:', deductError);
            return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
        }

        const result = deductResult as { success: boolean; message?: string; new_balance?: number };

        if (!result.success) {
            return NextResponse.json({ error: result.message || 'Insufficient balance' }, { status: 402 });
        }

        // 2. Call Vendor API (Digiflazz/Tripay)
        // mock vendor call
        let vendorSuccess = true;

        // Simulate randomness
        // if (Math.random() < 0.1) vendorSuccess = false;

        if (!vendorSuccess) {
            // 3. Refund if Vendor Fails
            const { error: refundError } = await supabase.rpc('refund_balance', {
                p_user_id: user.id,
                p_amount: amount
            });

            if (refundError) {
                console.error('CRITICAL: Refund failed after vendor failure!', { user_id: user.id, amount });
                // In real world, log to critical error monitoring
            }

            return NextResponse.json({ error: 'Provider transaction failed. Balance refunded.' }, { status: 502 });
        }

        // Success
        return NextResponse.json({
            success: true,
            data: {
                product_code,
                customer_no,
                status: 'PENDING',
                message: 'Transaction processing'
            }
        });

    } catch (error) {
        console.error('PPOB Transaction Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
