import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/console/stats
// Get usage statistics for user
// ==========================================

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        // Get total requests
        const { count: totalRequests } = await supabase
            .from('saas_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id);

        // Get this month's requests
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count: monthRequests } = await supabase
            .from('saas_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .gte('created_at', monthStart.toISOString());

        // Get success rate
        const { data: logs } = await supabase
            .from('saas_usage_logs')
            .select('status_code')
            .eq('user_id', user_id)
            .limit(100);

        const successCount = logs?.filter((log) => log.status_code >= 200 && log.status_code < 300).length || 0;
        const successRate = logs && logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 100;

        return NextResponse.json({
            success: true,
            stats: {
                total_requests: totalRequests || 0,
                month_requests: monthRequests || 0,
                success_rate: successRate,
                avg_response_time: 150, // TODO: Calculate from logs
            },
        });
    } catch (error: any) {
        console.error('[Console] Stats error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
