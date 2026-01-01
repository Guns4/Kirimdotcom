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
        const failed_only = searchParams.get('failed') === 'true';

        let query = supabase
            .from('webhook_logs')
            .select(`
        *,
        users(email, full_name)
      `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (failed_only) {
            query = query.or('status_code.is.null,status_code.neq.200');
        }

        const { data: logs, error } = await query;

        if (error) throw error;

        return NextResponse.json({ logs: logs || [] });
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
        const { log_id, action } = body;

        if (action === 'retry' && log_id) {
            // Get webhook log
            const { data: log } = await supabase
                .from('webhook_logs')
                .select('*')
                .eq('id', log_id)
                .single();

            if (!log) {
                return NextResponse.json({ error: 'Log not found' }, { status: 404 });
            }

            // Attempt to send webhook again
            try {
                const response = await fetch(log.endpoint_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Event': log.event_type || 'manual_retry'
                    },
                    body: JSON.stringify(log.payload || {})
                });

                const responseText = await response.text();

                // Update log with retry result
                await supabase
                    .from('webhook_logs')
                    .update({
                        status_code: response.status,
                        response_body: responseText.substring(0, 1000),
                        attempt_count: (log.attempt_count || 1) + 1,
                        delivered_at: response.ok ? new Date().toISOString() : null
                    })
                    .eq('id', log_id);

                return NextResponse.json({
                    success: true,
                    status_code: response.status,
                    message: response.ok ? 'Webhook delivered successfully!' : 'Webhook failed again'
                });
            } catch (fetchError: any) {
                // Update log with error
                await supabase
                    .from('webhook_logs')
                    .update({
                        status_code: 0,
                        response_body: 'Error: ' + fetchError.message,
                        attempt_count: (log.attempt_count || 1) + 1
                    })
                    .eq('id', log_id);

                return NextResponse.json({
                    success: false,
                    message: 'Network error: ' + fetchError.message
                });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
