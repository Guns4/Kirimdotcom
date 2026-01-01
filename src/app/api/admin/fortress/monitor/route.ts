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
        // Get server health summary
        const { data: health } = await supabase.rpc('get_server_health_summary');

        // Get recent stats (last 24 hours)
        const { data: stats } = await supabase
            .from('infra_server_stats')
            .select('*')
            .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('timestamp', { ascending: false })
            .limit(48); // One per hour for 24 hours

        // Get security incidents
        const { data: incidents } = await supabase.rpc('get_recent_security_incidents', { p_limit: 20 });

        // Get blocked IPs
        const { data: blockedIps } = await supabase
            .from('security_blocked_ips')
            .select('*')
            .order('banned_at', { ascending: false })
            .limit(50);

        return NextResponse.json({
            health: health && health.length > 0 ? health[0] : null,
            stats: stats || [],
            security: {
                incidents: incidents || [],
                blocked_ips: blockedIps || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, ip_address, reason, duration_hours } = body;

        if (action === 'BAN_IP') {
            await supabase.rpc('auto_ban_ip', {
                p_ip: ip_address,
                p_reason: reason || 'MANUAL',
                p_duration_hours: duration_hours || 24
            });

            return NextResponse.json({ success: true, message: 'IP banned' });
        } else if (action === 'UNBAN_IP') {
            await supabase
                .from('security_blocked_ips')
                .delete()
                .eq('ip_address', ip_address);

            return NextResponse.json({ success: true, message: 'IP unbanned' });
        } else if (action === 'LOG_STAT') {
            // Simulate server stat logging (in production, this would come from system metrics)
            const { data } = await supabase
                .from('infra_server_stats')
                .insert({
                    cpu_usage_percent: Math.random() * 100,
                    ram_usage_percent: Math.random() * 100,
                    disk_usage_percent: 45 + Math.random() * 20,
                    active_connections: Math.floor(Math.random() * 1000),
                    response_time_ms: Math.floor(Math.random() * 500)
                })
                .select()
                .single();

            return NextResponse.json({ success: true, stat: data });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
