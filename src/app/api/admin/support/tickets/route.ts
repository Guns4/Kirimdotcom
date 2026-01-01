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
        const priority = searchParams.get('priority');

        let query = supabase
            .from('support_tickets')
            .select(`
        *,
        users(email, full_name),
        ticket_messages(count)
      `)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (priority) {
            query = query.eq('priority', priority);
        }

        const { data: tickets, error } = await query;

        if (error) throw error;

        return NextResponse.json({ tickets: tickets || [] });
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
        const { ticket_id, message, update_status } = body;

        if (!ticket_id || !message) {
            return NextResponse.json({ error: 'ticket_id and message required' }, { status: 400 });
        }

        // Add admin reply
        const { error: msgError } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id,
                sender_role: 'ADMIN',
                message
            });

        if (msgError) throw msgError;

        // Update ticket status if provided
        if (update_status) {
            await supabase
                .from('support_tickets')
                .update({
                    status: update_status,
                    updated_at: new Date().toISOString(),
                    closed_at: update_status === 'CLOSED' ? new Date().toISOString() : null
                })
                .eq('id', ticket_id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
