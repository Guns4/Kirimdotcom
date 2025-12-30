import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ ads: [] });
    }

    const supabase = await createClient();

    // 1. Find Active Bids for Keyword
    // Order by Bid Price DESC to get highest bidder
    const { data: bids } = await supabase
        .from('ad_bids')
        .select('*, products:product_id(*)') // Mocking relation to product
        .eq('keyword', keyword.toLowerCase())
        .eq('status', 'ACTIVE')
        .order('bid_price', { ascending: false })
        .limit(3); // Top 3 Slots

    if (!bids || bids.length === 0) {
        return NextResponse.json({ ads: [] });
    }

    // 2. Async: Log Impressions (Don't await to speed up response)
    const impressionLog = bids.map(bid => ({
        bid_id: bid.id,
        type: 'IMPRESSION',
        cost: 0
    }));
    supabase.from('ad_analytics').insert(impressionLog).then(({ error }) => {
        if (error) console.error('Ad Impression Log Error', error);
    });

    return NextResponse.json({ ads: bids });
}
