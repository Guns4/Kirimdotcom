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
        const { data: tiers, error } = await supabase
            .from('loyalty_tiers')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        // Get tier distribution
        const { data: distribution } = await supabase.rpc('get_tier_distribution');

        return NextResponse.json({
            tiers: tiers || [],
            distribution: distribution || []
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
        const { tier_id, updates } = body;

        const { error } = await supabase
            .from('loyalty_tiers')
            .update(updates)
            .eq('id', tier_id);

        if (error) throw error;

        await supabase.rpc('log_admin_action', {
            p_admin_id: null,
            p_action: 'UPDATE_LOYALTY_TIER',
            p_details: { tier_id, ...updates },
            p_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
