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
        const filter = searchParams.get('filter');

        let query = supabase
            .from('cx_sessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (filter === 'ERRORS') {
            query = query.eq('has_errors', true);
        } else if (filter === 'RAGE_CLICKS') {
            query = query.eq('has_rage_clicks', true);
        }

        const { data: sessions, error } = await query;

        if (error) throw error;

        // Get NPS score
        const { data: npsData } = await supabase.rpc('calculate_nps_score');

        // Get recent NPS feedback
        const { data: feedback } = await supabase
            .from('cx_nps_scores')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            sessions: sessions || [],
            nps: npsData && npsData.length > 0 ? npsData[0] : null,
            recent_feedback: feedback || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
