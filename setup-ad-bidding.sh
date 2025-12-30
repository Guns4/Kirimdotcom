#!/bin/bash

# =============================================================================
# Monetization: Ad Bidding System (Task 87)
# =============================================================================

echo "Initializing Ad Bidding System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: ad_bidding_schema.sql"
cat <<EOF > ad_bidding_schema.sql
-- Ad Bids (Sellers bidding for keywords)
CREATE TABLE IF NOT EXISTS public.ad_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id),
    product_id UUID, -- Link to product being advertised
    keyword TEXT NOT NULL, -- e.g., "sepatu", "iphone"
    bid_price DECIMAL(19,4) NOT NULL CHECK (bid_price >= 100), -- Min bid Rp 100
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, NO_CREDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Wallet (Special credit for ads, separate from main wallet if needed, but we'll use main ledger for simplicity)
-- We'll assume 'ledger_entries' covers 'AD_CREDIT' type transactions.

-- Ad Analytics (Impressions & Clicks)
CREATE TABLE IF NOT EXISTS public.ad_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bid_id UUID REFERENCES public.ad_bids(id),
    type TEXT CHECK (type IN ('IMPRESSION', 'CLICK')),
    cost DECIMAL(19,4) DEFAULT 0, -- 0 for impression, bid_price for click
    user_id UUID, -- Who saw/clicked (optional, nullable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup during high-traffic selection
CREATE INDEX IF NOT EXISTS idx_ad_bids_keyword_status ON public.ad_bids(keyword, status);
CREATE INDEX IF NOT EXISTS idx_ad_bids_bid_price ON public.ad_bids(bid_price DESC);
EOF

# 2. Selection Algorithm API (Serve Ads)
echo "2. Creating API: src/app/api/ads/serve/route.ts"
mkdir -p src/app/api/ads/serve

cat <<EOF > src/app/api/ads/serve/route.ts
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
EOF

# 3. Billing API (Click Handler)
echo "3. Creating API: src/app/api/ads/click/route.ts"
mkdir -p src/app/api/ads/click

cat <<EOF > src/app/api/ads/click/route.ts
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
        description: \`Iklan Klik (Bid ID: \${bidId.substring(0,8)})\`
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
EOF

# 4. Sponsored Product Component
echo "4. Creating Component: src/components/ads/SponsoredProduct.tsx"
mkdir -p src/components/ads

cat <<EOF > src/components/ads/SponsoredProduct.tsx
'use client';

import { useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface SponsoredProductProps {
    bidId: string;
    sellerId: string;
    productName: string;
    productImage?: string;
    price: number;
    link: string;
}

export function SponsoredProduct({ bidId, sellerId, productName, productImage, price, link }: SponsoredProductProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        // Record Click & Audit Billing asynchronously
        // We don't block navigation, but we fire the request
        fetch('/api/ads/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidId, sellerId })
        });

        // Navigate
        window.open(link, '_blank');
    }

    return (
        <div 
            onClick={handleClick}
            className="group cursor-pointer border-2 border-amber-400 bg-amber-50/50 rounded-xl p-3 relative hover:shadow-lg transition-all"
        >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded tracking-wide">
                Ad
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-lg border border-amber-200 flex items-center justify-center text-xs text-center overflow-hidden">
                    {productImage ? <img src={productImage} alt={productName} className="object-cover" /> : 'Product'}
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {productName}
                    </h5>
                    <p className="text-sm font-semibold text-gray-700">
                        Rp {price.toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-700">
                        <Megaphone className="w-3 h-3" />
                        <span>Sponsored</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Ad Bidding System Setup Complete!"
echo "1. Run 'ad_bidding_schema.sql'."
echo "2. Call '/api/ads/serve?keyword=sepatu' to get ads."
echo "3. Use <SponsoredProduct /> to render results."
