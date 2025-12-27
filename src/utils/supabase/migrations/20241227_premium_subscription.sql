-- ============================================================================
-- PREMIUM SUBSCRIPTION SYSTEM
-- Phase 346-350: Recurring Revenue & Feature Locks
-- ============================================================================
-- ============================================================================
-- 1. USER SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL UNIQUE,
    -- Subscription details
    plan_type VARCHAR(20) DEFAULT 'free',
    -- 'free', 'pro', 'enterprise'
    is_premium BOOLEAN DEFAULT false,
    -- Billing
    billing_cycle VARCHAR(20),
    -- 'monthly', 'yearly'
    price_paid DECIMAL(10, 2) DEFAULT 0.00,
    -- Dates
    subscribed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    -- 'active', 'expired', 'cancelled', 'trial'
    auto_renew BOOLEAN DEFAULT false,
    -- Payment tracking
    last_payment_date TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ,
    payment_method VARCHAR(50),
    -- 'manual_transfer', 'midtrans', 'stripe'
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_premium ON public.user_subscriptions(is_premium);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
-- ============================================================================
-- 2. SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Plan details
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    -- Pricing
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2),
    -- Discounted annual price
    -- Features (stored as JSONB for flexibility)
    features JSONB NOT NULL,
    -- Example: {
    --   "max_wa_rotators": 10,
    --   "competitor_analysis": true,
    --   "no_watermark": true,
    --   "priority_support": true,
    --   "api_access": false
    -- }
    -- Limits
    max_wa_rotators INTEGER DEFAULT 1,
    max_ad_campaigns INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seed default plans
INSERT INTO public.subscription_plans (
        plan_code,
        plan_name,
        description,
        monthly_price,
        yearly_price,
        features,
        max_wa_rotators,
        max_ad_campaigns
    )
VALUES (
        'FREE',
        'Free',
        'Fitur dasar untuk seller pemula',
        0.00,
        0.00,
        '{
      "cek_ongkir": true,
      "tracking": true,
      "label_maker": true,
      "watermark": true,
      "max_wa_rotators": 1,
      "competitor_analysis": false,
      "caption_generator": true,
      "premium_support": false
    }'::jsonb,
        1,
        0
    ),
    (
        'PRO',
        'Pro',
        'Unlock semua fitur premium untuk scale bisnis',
        50000.00,
        500000.00,
        '{
      "cek_ongkir": true,
      "tracking": true,
      "label_maker": true,
      "watermark": false,
      "max_wa_rotators": 999,
      "competitor_analysis": true,
      "caption_generator": true,
      "premium_support": true,
      "priority_tracking": true,
      "bulk_check": true,
      "api_access": false
    }'::jsonb,
        999,
        5
    ),
    (
        'ENTERPRISE',
        'Enterprise',
        'Untuk bisnis besar dengan kebutuhan khusus',
        200000.00,
        2000000.00,
        '{
      "cek_ongkir": true,
      "tracking": true,
      "label_maker": true,
      "watermark": false,
      "max_wa_rotators": 9999,
      "competitor_analysis": true,
      "caption_generator": true,
      "premium_support": true,
      "priority_tracking": true,
      "bulk_check": true,
      "api_access": true,
      "white_label": true,
      "dedicated_account_manager": true
    }'::jsonb,
        9999,
        999
    ) ON CONFLICT (plan_code) DO NOTHING;
-- ============================================================================
-- 3. PAYMENT HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User & subscription
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE
    SET NULL,
        -- Payment details
        amount DECIMAL(10, 2) NOT NULL,
        plan_code VARCHAR(50) NOT NULL,
        billing_cycle VARCHAR(20),
        -- 'monthly', 'yearly'
        -- Payment info
        payment_method VARCHAR(50),
        payment_proof_url TEXT,
        -- For manual transfer
        transaction_id VARCHAR(255),
        -- Status
        status VARCHAR(20) DEFAULT 'pending',
        -- 'pending', 'confirmed', 'rejected', 'refunded'
        -- Dates
        paid_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ,
        confirmed_by UUID,
        -- Admin who confirmed
        -- Metadata
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
-- ============================================================================
-- 4. FUNCTIONS: Check if user is premium
-- ============================================================================
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_is_premium BOOLEAN;
BEGIN
SELECT is_premium INTO v_is_premium
FROM public.user_subscriptions
WHERE user_id = p_user_id
    AND status = 'active'
    AND (
        expires_at IS NULL
        OR expires_at > NOW()
    );
RETURN COALESCE(v_is_premium, false);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTIONS: Get user plan features
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_plan_features(p_user_id UUID) RETURNS JSONB AS $$
DECLARE v_plan_code VARCHAR(50);
v_features JSONB;
BEGIN -- Get user's current plan
SELECT plan_type INTO v_plan_code
FROM public.user_subscriptions
WHERE user_id = p_user_id
    AND status = 'active';
-- If no subscription, return free plan
IF v_plan_code IS NULL THEN v_plan_code := 'FREE';
END IF;
-- Get plan features
SELECT features INTO v_features
FROM public.subscription_plans
WHERE plan_code = v_plan_code;
RETURN v_features;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. FUNCTIONS: Create or update subscription
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_user_subscription(
        p_user_id UUID,
        p_plan_code VARCHAR,
        p_billing_cycle VARCHAR,
        p_price_paid DECIMAL
    ) RETURNS UUID AS $$
DECLARE v_subscription_id UUID;
v_expires_at TIMESTAMPTZ;
BEGIN -- Calculate expiration date
IF p_billing_cycle = 'yearly' THEN v_expires_at := NOW() + INTERVAL '1 year';
ELSE v_expires_at := NOW() + INTERVAL '1 month';
END IF;
-- Upsert subscription
INSERT INTO public.user_subscriptions (
        user_id,
        plan_type,
        is_premium,
        billing_cycle,
        price_paid,
        subscribed_at,
        expires_at,
        status,
        last_payment_date,
        next_billing_date
    )
VALUES (
        p_user_id,
        p_plan_code,
        CASE
            WHEN p_plan_code != 'FREE' THEN true
            ELSE false
        END,
        p_billing_cycle,
        p_price_paid,
        NOW(),
        v_expires_at,
        'active',
        NOW(),
        v_expires_at
    ) ON CONFLICT (user_id) DO
UPDATE
SET plan_type = p_plan_code,
    is_premium = CASE
        WHEN p_plan_code != 'FREE' THEN true
        ELSE false
    END,
    billing_cycle = p_billing_cycle,
    price_paid = p_price_paid,
    expires_at = v_expires_at,
    status = 'active',
    last_payment_date = NOW(),
    next_billing_date = v_expires_at,
    updated_at = NOW()
RETURNING id INTO v_subscription_id;
RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans FOR
SELECT USING (is_active = true);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Premium Subscription system created successfully!';
RAISE NOTICE '💎 Plans: FREE, PRO, ENTERPRISE';
RAISE NOTICE '🔒 Feature locks ready for implementation';
RAISE NOTICE '💰 Recurring revenue infrastructure complete!';
END $$;