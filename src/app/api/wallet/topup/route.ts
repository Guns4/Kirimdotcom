import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSnapToken } from '@/lib/api/midtrans';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/wallet/topup
// Create topup transaction with Midtrans
// ==========================================

export async function POST(req: Request) {
    try {
        const { user_id, amount } = await req.json();

        // Validation
        if (!user_id || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, amount' },
                { status: 400 }
            );
        }

        if (amount < 10000) {
            return NextResponse.json(
                { error: 'Minimum topup amount is Rp 10,000' },
                { status: 400 }
            );
        }

        if (amount > 10000000) {
            return NextResponse.json(
                { error: 'Maximum topup amount is Rp 10,000,000' },
                { status: 400 }
            );
        }

        // Generate unique transaction ID
        const trxId = `TOPUP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        console.log('[Topup] Creating transaction:', trxId, 'Amount:', amount);

        // Get user details for Midtrans
        const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', user_id)
            .single();

        // Create Midtrans Snap token
        const midtransResult = await createSnapToken({
            orderId: trxId,
            amount: amount,
            customerDetails: {
                first_name: user?.full_name || 'User',
                email: user?.email || '',
            },
        });

        if (!midtransResult.success) {
            throw new Error(midtransResult.error || 'Failed to create payment');
        }

        // Save to database
        const { error: insertError } = await supabase.from('wallet_topups').insert({
            user_id,
            trx_id: trxId,
            amount,
            status: 'PENDING',
            snap_token: midtransResult.token,
            payment_url: midtransResult.redirect_url,
        });

        if (insertError) {
            console.error('[Topup] Database insert error:', insertError);
            throw new Error('Failed to create topup record');
        }

        console.log('[Topup] ✅ Transaction created successfully');

        return NextResponse.json({
            success: true,
            trx_id: trxId,
            token: midtransResult.token,
            redirect_url: midtransResult.redirect_url,
        });
    } catch (error: any) {
        console.error('[Topup] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create topup transaction',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET /api/wallet/topup
// Get user's topup history
// ==========================================

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('wallet_topups')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            topups: data,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Failed to fetch topup history',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
