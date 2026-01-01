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
        const unread_only = searchParams.get('unread') === 'true';

        let query = supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (unread_only) {
            query = query.eq('is_read', false);
        }

        const { data: notifications, error } = await query;

        if (error) throw error;

        return NextResponse.json({ notifications: notifications || [] });
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
        const { notification_id, mark_all_read } = body;

        if (mark_all_read) {
            // Mark all as read
            await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('is_read', false);
        } else if (notification_id) {
            // Mark specific notification as read
            await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('id', notification_id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
