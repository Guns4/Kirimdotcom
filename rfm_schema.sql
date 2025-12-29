-- Ensure Dependencies Exist (Wallets & Ledger)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    balance DECIMAL(19, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id),
    amount DECIMAL(19, 4) NOT NULL,
    entry_type TEXT NOT NULL, -- 'CREDIT' or 'DEBIT'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store User Segments
CREATE TABLE IF NOT EXISTS public.user_segments (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    segment TEXT NOT NULL,         -- 'SULTAN', 'CHURN_RISK', 'NEWBIE', 'REGULAR'
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_user_segment ON public.user_segments(segment);

-- View: Raw RFM Metrics per User
CREATE OR REPLACE VIEW view_rfm_raw AS
SELECT 
    u.id as user_id,
    
    -- Recency: Days since last transaction
    COALESCE(extract(day from now() - MAX(le.created_at)), 999) as recency_days,
    
    -- Frequency: Total count of DEBIT transactions (Spending)
    COUNT(le.id) filter (where le.entry_type = 'DEBIT') as frequency,
    
    -- Monetary: Total Spent
    COALESCE(SUM(le.amount) filter (where le.entry_type = 'DEBIT'), 0) as monetary
    
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
LEFT JOIN public.ledger_entries le ON le.wallet_id = w.id
GROUP BY u.id;
