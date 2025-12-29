import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();

    // 1. Fetch Raw Metrics
    const { data: metrics } = await supabase.from('view_rfm_raw').select('*');
    if (!metrics) return NextResponse.json({ processed: 0 });

    // 2. Compute Percentiles (Simple In-Memory for small datasets, use DB window functions for large)
    // For 'Sultan', top 5% Monetary
    const sortedByMoney = [...metrics].sort((a, b) => b.monetary - a.monetary);
    const top5Index = Math.floor(sortedByMoney.length * 0.05);
    const sultanThreshold = sortedByMoney[top5Index]?.monetary || 10000000;

    const updates = [];

    for (const m of metrics) {
        let segment = 'REGULAR';

        if (m.frequency === 0) {
            segment = 'NEWBIE';
        } else if (m.recency_days > 30) {
            segment = 'CHURN_RISK';
        } else if (m.monetary >= sultanThreshold && m.monetary > 0) {
            segment = 'SULTAN';
        }

        // Upsert Logic (Batched ideally, separate for demo)
        updates.push({
            user_id: m.user_id,
            segment,
            last_computed_at: new Date().toISOString()
        });
    }

    // 3. Batch Upsert
    if (updates.length > 0) {
        // Supabase upsert
        const { error } = await supabase.from('user_segments').upsert(updates);
        if (error) console.error('RFM Upsert Error', error);
    }

    return NextResponse.json({ processed: updates.length, top_threshold: sultanThreshold });
}
