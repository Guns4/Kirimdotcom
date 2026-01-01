import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/console/stats
// Get comprehensive usage statistics
// ==========================================

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        // Get API key info (quota limit)
        const { data: apiKey } = await supabase
            .from('saas_api_keys')
            .select('quota_limit, request_count')
            .eq('user_id', user_id)
            .eq('is_active', true)
            .single();

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

        // Get success rate (last 100 requests)
        const { data: recentLogs } = await supabase
            .from('saas_usage_logs')
            .select('status_code')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(100);

        const successCount =
            recentLogs?.filter((log) => log.status_code >= 200 && log.status_code < 300).length || 0;
        const successRate =
            recentLogs && recentLogs.length > 0 ? Math.round((successCount / recentLogs.length) * 100) : 100;

        // Get average response time (last 100 requests)
        const { data: timingLogs } = await supabase
            .from('saas_usage_logs')
            .select('response_time')
            .eq('user_id', user_id)
            .not('response_time', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100);

        const avgResponseTime =
            timingLogs && timingLogs.length > 0
                ? Math.round(
                    timingLogs.reduce((sum, log) => sum + (log.response_time || 0), 0) / timingLogs.length
                )
                : 150;

        // Calculate reset date (first day of next month)
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1);
        resetDate.setDate(1);
        const resetDateStr = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return NextResponse.json({
            success: true,
            stats: {
                total_requests: totalRequests || 0,
                month_requests: monthRequests || apiKey?.request_count || 0,
                quota_limit: apiKey?.quota_limit || 10000,
                success_rate: successRate,
                avg_response_time: avgResponseTime,
                reset_date: resetDateStr,
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
