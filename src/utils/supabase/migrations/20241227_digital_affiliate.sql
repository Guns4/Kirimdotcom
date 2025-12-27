-- ============================================================================
-- DIGITAL AFFILIATE SYSTEM DATABASE SCHEMA
-- Phase 311-315: Viral Marketing & Commission System
-- ============================================================================
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================================================
-- 1. AFFILIATE PROGRAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Program details
    program_name VARCHAR(255) NOT NULL,
    program_slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    -- Commission structure
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    -- Percentage (e.g., 20.00 = 20%)
    commission_type VARCHAR(20) DEFAULT 'percentage',
    -- 'percentage' or 'fixed'
    fixed_amount DECIMAL(10, 2),
    -- For fixed commission type
    -- Cookie settings
    cookie_duration_days INTEGER DEFAULT 30,
    -- Applicable products (NULL = all products)
    product_types TEXT [],
    -- e.g., ['ebook', 'bundle', 'premium']
    specific_product_ids UUID [],
    -- Specific product UUIDs
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_slug ON public.affiliate_programs(program_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_active ON public.affiliate_programs(is_active);
-- ============================================================================
-- 2. AFFILIATE USERS TABLE (Who can be affiliates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    -- Link to auth.users
    -- Affiliate identification
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., 'user123', 'johndoe'
    -- Profile
    display_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    -- Payment info
    payment_method VARCHAR(50),
    -- 'bank_transfer', 'ewallet', etc.
    payment_details JSONB,
    -- Bank account, e-wallet number, etc.
    -- Statistics
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,
    available_balance DECIMAL(12, 2) GENERATED ALWAYS AS (total_earnings - total_withdrawn) STORED,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_users_code ON public.affiliate_users(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_users_user_id ON public.affiliate_users(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_users_active ON public.affiliate_users(is_active);
-- ============================================================================
-- 3. AFFILIATE CLICKS TABLE (Track click events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Affiliate info
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL,
    -- Click details
    product_type VARCHAR(50),
    -- 'ebook', 'bundle', 'premium'
    product_id UUID,
    -- Specific product clicked
    landing_page TEXT,
    -- URL where user landed
    -- Visitor info
    visitor_ip VARCHAR(45),
    visitor_user_agent TEXT,
    visitor_country VARCHAR(2),
    -- Tracking
    referrer TEXT,
    -- Where the click came from
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    -- Conversion tracking
    converted BOOLEAN DEFAULT false,
    conversion_id UUID,
    -- Link to purchase if converted
    -- Metadata
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON public.affiliate_clicks(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON public.affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON public.affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON public.affiliate_clicks(clicked_at);
-- ============================================================================
-- 4. AFFILIATE EARNINGS TABLE (Commission records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Affiliate info
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL,
    -- Purchase info
    purchase_type VARCHAR(50) NOT NULL,
    -- 'ebook', 'bundle', 'premium'
    purchase_id UUID NOT NULL,
    -- Link to actual purchase
    purchase_amount DECIMAL(10, 2) NOT NULL,
    -- Commission calculation
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    -- Click tracking
    click_id UUID REFERENCES public.affiliate_clicks(id),
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected', 'paid'
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    -- Payment
    paid_at TIMESTAMPTZ,
    withdrawal_id UUID,
    -- Metadata
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_user ON public.affiliate_earnings(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON public.affiliate_earnings(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_date ON public.affiliate_earnings(earned_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_purchase ON public.affiliate_earnings(purchase_id);
-- ============================================================================
-- 5. AFFILIATE WITHDRAWALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Affiliate info
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    -- Withdrawal details
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'cancelled'
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    -- Admin notes
    admin_notes TEXT,
    -- Metadata
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_user ON public.affiliate_withdrawals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_status ON public.affiliate_withdrawals(status);
-- ============================================================================
-- 6. SEED DATA: Default Affiliate Program
-- ============================================================================
INSERT INTO public.affiliate_programs (
        program_name,
        program_slug,
        description,
        commission_rate,
        commission_type,
        cookie_duration_days,
        product_types,
        is_active
    )
VALUES (
        'Digital Products Affiliate Program',
        'digital-products-affiliate',
        'Earn 20% commission on all digital product sales (e-books, bundles, premium memberships)',
        20.00,
        'percentage',
        30,
        ARRAY ['ebook', 'bundle', 'premium'],
        true
    ) ON CONFLICT (program_slug) DO NOTHING;
-- ============================================================================
-- 7. FUNCTIONS: Helper Functions
-- ============================================================================
-- Calculate commission amount
CREATE OR REPLACE FUNCTION calculate_commission(
        purchase_amt DECIMAL,
        commission_pct DECIMAL
    ) RETURNS DECIMAL AS $$ BEGIN RETURN ROUND(
        (purchase_amt * commission_pct / 100)::numeric,
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- Generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(user_email TEXT) RETURNS VARCHAR(50) AS $$
DECLARE base_code VARCHAR(50);
final_code VARCHAR(50);
counter INTEGER := 0;
BEGIN -- Extract username from email
base_code := LOWER(SPLIT_PART(user_email, '@', 1));
base_code := REGEXP_REPLACE(base_code, '[^a-z0-9]', '', 'g');
base_code := SUBSTRING(base_code, 1, 20);
final_code := base_code;
-- Ensure uniqueness
WHILE EXISTS (
    SELECT 1
    FROM public.affiliate_users
    WHERE affiliate_code = final_code
) LOOP counter := counter + 1;
final_code := base_code || counter::TEXT;
END LOOP;
RETURN final_code;
END;
$$ LANGUAGE plpgsql;
-- Update affiliate statistics (trigger function)
CREATE OR REPLACE FUNCTION update_affiliate_stats() RETURNS TRIGGER AS $$ BEGIN IF (
        TG_OP = 'INSERT'
        OR TG_OP = 'UPDATE'
    ) THEN -- Update total earnings
UPDATE public.affiliate_users
SET total_earnings = (
        SELECT COALESCE(SUM(commission_amount), 0)
        FROM public.affiliate_earnings
        WHERE affiliate_user_id = NEW.affiliate_user_id
            AND status IN ('approved', 'paid')
    ),
    total_referrals = (
        SELECT COUNT(DISTINCT purchase_id)
        FROM public.affiliate_earnings
        WHERE affiliate_user_id = NEW.affiliate_user_id
    )
WHERE id = NEW.affiliate_user_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_affiliate_stats
AFTER
INSERT
    OR
UPDATE ON public.affiliate_earnings FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();
-- ============================================================================
-- 8. RLS POLICIES (Row Level Security)
-- ============================================================================
-- Affiliate users: Users can view/update their own record
ALTER TABLE public.affiliate_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own affiliate profile" ON public.affiliate_users FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own affiliate profile" ON public.affiliate_users FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their affiliate profile" ON public.affiliate_users FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Affiliate clicks: Affiliates can view their own clicks
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates can view their own clicks" ON public.affiliate_clicks FOR
SELECT USING (
        affiliate_user_id IN (
            SELECT id
            FROM public.affiliate_users
            WHERE user_id = auth.uid()
        )
    );
-- Affiliate earnings: Affiliates can view their own earnings
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates can view their own earnings" ON public.affiliate_earnings FOR
SELECT USING (
        affiliate_user_id IN (
            SELECT id
            FROM public.affiliate_users
            WHERE user_id = auth.uid()
        )
    );
-- Affiliate withdrawals: Users can manage their own withdrawals
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates can view their own withdrawals" ON public.affiliate_withdrawals FOR
SELECT USING (
        affiliate_user_id IN (
            SELECT id
            FROM public.affiliate_users
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Affiliates can create withdrawal requests" ON public.affiliate_withdrawals FOR
INSERT WITH CHECK (
        affiliate_user_id IN (
            SELECT id
            FROM public.affiliate_users
            WHERE user_id = auth.uid()
        )
    );
-- Affiliate programs: Public read
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate programs are viewable by everyone" ON public.affiliate_programs FOR
SELECT USING (is_active = true);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Affiliate system database schema created successfully!';
RAISE NOTICE '📊 Tables: affiliate_programs, affiliate_users, affiliate_clicks, affiliate_earnings, affiliate_withdrawals';
RAISE NOTICE '💰 Default program: 20%% commission on digital products';
RAISE NOTICE '🍪 Cookie tracking: 30 days attribution window';
RAISE NOTICE '🔒 RLS policies enabled for data security';
END $$;