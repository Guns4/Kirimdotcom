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
        const status = searchParams.get('status');

        let query = supabase
            .from('agents')
            .select(`
        *,
        users(email, full_name),
        iot_devices(count)
      `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: agents, error } = await query;

        if (error) throw error;

        return NextResponse.json({ agents: agents || [] });
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
        const { agent_id, action } = body;

        if (!agent_id || !action) {
            return NextResponse.json({
                error: 'agent_id and action required'
            }, { status: 400 });
        }

        if (action === 'APPROVE') {
            const { error } = await supabase
                .from('agents')
                .update({
                    status: 'ACTIVE',
                    approved_at: new Date().toISOString()
                })
                .eq('id', agent_id);

            if (error) throw error;

            // TODO: Send notification to agent

            return NextResponse.json({ success: true, message: 'Agent approved' });
        } else if (action === 'REJECT') {
            const { error } = await supabase
                .from('agents')
                .update({ status: 'REJECTED' })
                .eq('id', agent_id);

            if (error) throw error;

            return NextResponse.json({ success: true, message: 'Agent rejected' });
        } else if (action === 'SUSPEND') {
            const { error } = await supabase
                .from('agents')
                .update({ status: 'SUSPENDED' })
                .eq('id', agent_id);

            if (error) throw error;

            return NextResponse.json({ success: true, message: 'Agent suspended' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
