-- =============================================================================
-- DIGITAL AFFILIATE SYSTEM DATABASE SCHEMA (FIXED & CLEAN)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. AFFILIATE PROGRAMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name VARCHAR(255) NOT NULL,
    program_slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    commission_rate DECIMAL(5, 2) DEFAULT 20.00,
    commission_type VARCHAR(20) DEFAULT 'percentage',
    fixed_amount DECIMAL(10, 2),
    cookie_duration_days INTEGER DEFAULT 30,
    product_types TEXT [],
    specific_product_ids UUID [],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 2. AFFILIATE USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    payment_method VARCHAR(50),
    payment_details JSONB,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    total_withdrawn DECIMAL(12, 2) DEFAULT 0,
    available_balance DECIMAL(12, 2) GENERATED ALWAYS AS (total_earnings - total_withdrawn) STORED,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 3. AFFILIATE CLICKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL,
    product_type VARCHAR(50),
    product_id UUID,
    landing_page TEXT,
    visitor_ip VARCHAR(45),
    visitor_user_agent TEXT,
    visitor_country VARCHAR(2),
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    converted BOOLEAN DEFAULT false,
    conversion_id UUID,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 4. AFFILIATE EARNINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL,
    purchase_type VARCHAR(50) NOT NULL,
    purchase_id UUID NOT NULL,
    purchase_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    click_id UUID REFERENCES public.affiliate_clicks(id),
    status VARCHAR(20) DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    paid_at TIMESTAMPTZ,
    withdrawal_id UUID,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 5. AFFILIATE WITHDRAWALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_user_id UUID NOT NULL REFERENCES public.affiliate_users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 6. FUNCTIONS (SETELAH TABLE ADA)
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_commission(
        purchase_amt DECIMAL,
        commission_pct DECIMAL
    ) RETURNS DECIMAL AS $$ BEGIN RETURN ROUND(
        (purchase_amt * commission_pct / 100)::numeric,
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
CREATE OR REPLACE FUNCTION update_affiliate_stats() RETURNS TRIGGER AS $$ BEGIN
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
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. TRIGGER (PALING AKHIR)
-- =============================================================================
CREATE TRIGGER trigger_update_affiliate_stats
AFTER
INSERT
    OR
UPDATE ON public.affiliate_earnings FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();