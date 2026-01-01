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
        const { data: flags, error } = await supabase
            .from('system_flags')
            .select('*')
            .order('key');

        if (error) throw error;

        return NextResponse.json({ flags: flags || [] });
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
        const { flag_key, is_enabled } = body;

        if (!flag_key || typeof is_enabled !== 'boolean') {
            return NextResponse.json({ error: 'flag_key and is_enabled required' }, { status: 400 });
        }

        // Update flag
        const { error } = await supabase
            .from('system_flags')
            .update({
                is_enabled,
                updated_at: new Date().toISOString()
            })
            .eq('key', flag_key);

        if (error) throw error;

        // Log admin action
        await supabase.rpc('log_admin_action', {
            p_admin_id: null, // In production, get from session
            p_action: 'TOGGLE_FEATURE_FLAG',
            p_details: { flag: flag_key, enabled: is_enabled },
            p_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
