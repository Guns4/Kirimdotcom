import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { bidId, sellerId } = body;

    if (!bidId) return NextResponse.json({ error: 'Missing Bid ID' }, { status: 400 });

    const supabase = await createClient();

    // 1. Get Bid Details (Secure check)
    const { data: bid } = await supabase
        .from('ad_bids')
        .select('bid_price')
        .eq('id', bidId)
        .single();

    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

    const cost = bid.bid_price;

    // 2. Charge Seller (CPC)
    const { error: ledgerError } = await supabase.from('ledger_entries').insert({
        user_id: sellerId,
        amount: -cost,
        type: 'AD_SPEND',
        description: `Iklan Klik (Bid ID: ${bidId.substring(0, 8)})`
    } as any);

    if (ledgerError) {
        console.error('Ad Billing Error', ledgerError);
        // Continue to log analytic but maybe flag as unpaid?
        // Ideally we check balance first, but for speed we optimistic charge
    }

    // 3. Log Click Analytic
    await supabase.from('ad_analytics').insert({
        bid_id: bidId,
        type: 'CLICK',
        cost: cost
    });

    return NextResponse.json({ success: true, cost });
}
