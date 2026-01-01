import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get('zone');

    if (!zone) {
        return NextResponse.json({ error: 'Zone required' }, { status: 400 });
    }

    try {
        // 1. Get active ads for this zone
        const { data: ads, error } = await supabase
            .from('ad_campaigns')
            .select('*')
            .eq('zone_code', zone)
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        if (!ads || ads.length === 0) {
            return NextResponse.json({ ad: null });
        }

        // 2. Random rotation (if multiple ads in same zone)
        const randomAd = ads[Math.floor(Math.random() * ads.length)];

        // 3. Increment view counter (fire and forget - async)
        supabase.rpc('increment_ad_view', { ad_id: randomAd.id }).then();

        return NextResponse.json({ ad: randomAd });
    } catch (error: any) {
        console.error('Ad serve error:', error);
        return NextResponse.json({ ad: null });
    }
}
