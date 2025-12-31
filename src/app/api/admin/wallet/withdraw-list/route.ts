import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/admin/wallet/withdraw-list
// Get pending withdrawal requests
// ==========================================

export async function GET(req: Request) {
    try {
        // Security check
        const secret = req.headers.get('x-admin-secret');
        if (secret !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'PENDING';

        // Get withdrawal requests with user details
        const { data, error } = await supabase
            .from('wallet_withdrawals')
            .select(`
        *,
        users!inner(
          id,
          email,
          full_name,
          wallet_balance
        )
      `)
            .eq('status', status)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            withdrawals: data,
            count: data?.length || 0,
        });
    } catch (error: any) {
        console.error('[Admin] Withdraw list error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch withdrawal requests',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
