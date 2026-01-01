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

        // Get cost summary
        const { data: summary, error: summaryError } = await supabase.rpc('get_ai_cost_summary', {
            p_start_date: startDate,
            p_end_date: endDate
        });

        if (summaryError) throw summaryError;

        // Get daily breakdown
        const { data: dailyData, error: dailyError } = await supabase
            .from('ai_usage_logs')
            .select('created_at, cost_usd, feature, model')
            .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .lte('created_at', endDate || new Date().toISOString())
            .order('created_at', { ascending: true });

        if (dailyError) throw dailyError;

        // Group by day
        const dailyBreakdown: any = {};
        (dailyData || []).forEach((log: any) => {
            const day = new Date(log.created_at).toISOString().split('T')[0];
            if (!dailyBreakdown[day]) {
                dailyBreakdown[day] = { cost: 0, requests: 0 };
            }
            dailyBreakdown[day].cost += parseFloat(log.cost_usd || 0);
            dailyBreakdown[day].requests += 1;
        });

        return NextResponse.json({
            summary: summary && summary.length > 0 ? summary[0] : {
                total_cost_usd: 0,
                total_requests: 0,
                total_tokens: 0,
                cost_by_feature: {}
            },
            daily_breakdown: dailyBreakdown
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
