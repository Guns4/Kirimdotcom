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
