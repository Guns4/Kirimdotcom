import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        // Call profit calculation function
        const { data, error } = await supabase.rpc('calculate_profit_summary', {
            p_start_date: startDate,
            p_end_date: endDate
        });

        if (error) throw error;

        const result = data && data.length > 0 ? data[0] : {
            total_revenue: 0,
            total_cost: 0,
            net_profit: 0,
            profit_margin: 0
        };

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
