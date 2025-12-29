import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    // Only Admin
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    // Aggregate Segments
    // SELECT segment, count(*) FROM user_segments GROUP BY segment
    const { data } = await supabase
        .from('user_segments')
        .select('segment'); // Client-side count or RPC for speed

    const stats: Record<string, number> = {
        SULTAN: 0,
        CHURN_RISK: 0,
        NEWBIE: 0,
        REGULAR: 0
    };

    data?.forEach((row: any) => {
        if (stats[row.segment] !== undefined) stats[row.segment]++;
    });

    return NextResponse.json(stats);
}
