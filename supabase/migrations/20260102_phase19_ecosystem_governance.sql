-- ============================================
-- GOD MODE PHASE 2301-2400: ECOSYSTEM GOVERNANCE & COMMERCIAL OPS
-- Dispute Resolution, Affiliate Management, PPOB Bulk Pricing
-- ============================================
-- MARKET DISPUTES TABLE (Digital Courtroom)
CREATE TABLE IF NOT EXISTS public.market_disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.marketplace_orders(id),
    buyer_id UUID REFERENCES public.users(id),
    seller_id UUID REFERENCES public.users(id),
    reason VARCHAR(100) CHECK (
        reason IN (
            'DAMAGED_ITEM',
            'NOT_AS_DESCRIBED',
            'NOT_RECEIVED',
            'QUALITY_ISSUE',
            'SCAM',
            'OTHER'
        )
    ),
    buyer_evidence_urls TEXT [],
    -- Photos/videos from buyer
    seller_evidence_urls TEXT [],
    -- Photos/videos from seller
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'MEDIATION', 'RESOLVED', 'CLOSED')
    ),
    winner VARCHAR(10) CHECK (winner IN ('BUYER', 'SELLER', 'SPLIT', NULL)),
    admin_verdict_note TEXT,
    escrow_amount DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
-- DISPUTE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.market_dispute_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.market_disputes(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    sender_role VARCHAR(10) CHECK (sender_role IN ('BUYER', 'SELLER', 'ADMIN')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- AFFILIATE PAYOUTS TABLE (Commission Tracking)
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    -- '2024-01', '2024-Q1'
    referral_count_snapshot INT DEFAULT 0,
    total_revenue_generated DECIMAL(15, 2) DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 20.0,
    -- 20%
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PROCESSING', 'PAID', 'CANCELLED')
    ),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- PPOB MARGIN RULES TABLE (Bulk Pricing)
CREATE TABLE IF NOT EXISTS public.ppob_margin_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (
        category IN ('PULSA', 'PLN', 'GAME', 'VOUCHER', 'BPJS', 'ALL')
    ),
    provider VARCHAR(50),
    -- 'TELKOMSEL', 'XL', 'INDOSAT', NULL for all
    margin_type VARCHAR(10) CHECK (margin_type IN ('FIXED', 'PERCENT')),
    margin_value DECIMAL(10, 2) NOT NULL,
    -- 500 or 2.5
    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 0,
    -- Higher priority rules applied first
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.market_disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer ON public.market_disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller ON public.market_disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_dispute_chats_dispute ON public.market_dispute_chats(dispute_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_user ON public.affiliate_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON public.affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_ppob_margin_active ON public.ppob_margin_rules(is_active);
-- Row Level Security
ALTER TABLE public.market_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_dispute_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppob_margin_rules ENABLE ROW LEVEL SECURITY;
-- Function to resolve dispute
CREATE OR REPLACE FUNCTION resolve_dispute(
        p_dispute_id UUID,
        p_winner VARCHAR,
        p_verdict_note TEXT
    ) RETURNS void AS $$
DECLARE v_transaction_id UUID;
v_buyer_id UUID;
v_seller_id UUID;
v_escrow_amount DECIMAL;
BEGIN -- Get dispute details
SELECT transaction_id,
    buyer_id,
    seller_id,
    escrow_amount INTO v_transaction_id,
    v_buyer_id,
    v_seller_id,
    v_escrow_amount
FROM public.market_disputes
WHERE id = p_dispute_id;
-- Update dispute status
UPDATE public.market_disputes
SET status = 'RESOLVED',
    winner = p_winner,
    admin_verdict_note = p_verdict_note,
    resolved_at = now()
WHERE id = p_dispute_id;
-- Handle money movement
IF p_winner = 'BUYER' THEN -- Refund to buyer (would trigger refund process)
-- In real implementation, this would call refund API
NULL;
ELSIF p_winner = 'SELLER' THEN -- Release to seller (would trigger payout)
NULL;
ELSIF p_winner = 'SPLIT' THEN -- Split 50/50
NULL;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to calculate affiliate commissions
CREATE OR REPLACE FUNCTION calculate_affiliate_commissions(p_period VARCHAR) RETURNS TABLE (
        user_id UUID,
        referral_count BIGINT,
        total_revenue DECIMAL,
        commission_amount DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT u.referred_by as user_id,
    COUNT(DISTINCT u.id) as referral_count,
    COALESCE(SUM(mo.total_amount), 0) as total_revenue,
    COALESCE(SUM(mo.total_amount), 0) * 0.20 as commission_amount
FROM public.users u
    LEFT JOIN public.marketplace_orders mo ON u.id = mo.user_id
    AND mo.status = 'COMPLETED'
    AND TO_CHAR(mo.created_at, 'YYYY-MM') = p_period
WHERE u.referred_by IS NOT NULL
GROUP BY u.referred_by
HAVING COUNT(DISTINCT u.id) > 0;
END;
$$ LANGUAGE plpgsql;
-- Function to get affiliate tree
CREATE OR REPLACE FUNCTION get_affiliate_tree(p_user_id UUID, p_depth INT DEFAULT 3) RETURNS TABLE (
        user_id UUID,
        email VARCHAR,
        level INT,
        parent_id UUID
    ) AS $$ BEGIN RETURN QUERY WITH RECURSIVE affiliate_tree AS (
        -- Root user
        SELECT u.id as user_id,
            u.email,
            0 as level,
            u.referred_by as parent_id
        FROM public.users u
        WHERE u.id = p_user_id
        UNION ALL
        -- Referrals
        SELECT u.id,
            u.email,
            at.level + 1,
            u.referred_by
        FROM public.users u
            INNER JOIN affiliate_tree at ON u.referred_by = at.user_id
        WHERE at.level < p_depth
    )
SELECT *
FROM affiliate_tree
ORDER BY level,
    email;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.market_disputes IS 'Buyer-seller disputes for marketplace transactions';
COMMENT ON TABLE public.affiliate_payouts IS 'Referral commission payments tracking';
COMMENT ON TABLE public.ppob_margin_rules IS 'Bulk pricing rules for digital products';