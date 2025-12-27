-- =============================================================================
-- PUBLIC API SYSTEM
-- Phase 426-430: API Economy & Developer Monetization
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. API KEYS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner
    user_id UUID NOT NULL,
    -- API Key
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64),
    -- Permissions
    allowed_endpoints TEXT [] DEFAULT ARRAY ['track', 'ongkir'],
    rate_limit_per_day INTEGER DEFAULT 100,
    -- Free tier
    -- Usage tracking
    total_requests INTEGER DEFAULT 0,
    requests_today INTEGER DEFAULT 0,
    last_request_at TIMESTAMPTZ,
    last_reset_at DATE DEFAULT CURRENT_DATE,
    -- Billing
    is_paid BOOLEAN DEFAULT false,
    cost_per_request DECIMAL(10, 2) DEFAULT 50.00,
    -- Rp 50
    total_cost DECIMAL(12, 2) DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active);
-- =============================================================================
-- 2. API USAGE LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- API Key
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Request details
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    -- Request data
    request_params JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    -- Billing
    was_charged BOOLEAN DEFAULT false,
    charge_amount DECIMAL(10, 2) DEFAULT 0,
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON public.api_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON public.api_usage_log(created_at);
-- Partition by month for performance (optional)
-- CREATE INDEX IF NOT EXISTS idx_api_usage_month ON public.api_usage_log(date_trunc('month', created_at));
-- =============================================================================
-- 3. FUNCTION: Generate API Key
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_api_key(
        p_user_id UUID,
        p_key_name VARCHAR,
        p_is_paid BOOLEAN DEFAULT false
    ) RETURNS TABLE(api_key VARCHAR, api_secret VARCHAR) AS $$
DECLARE v_key VARCHAR;
v_secret VARCHAR;
BEGIN -- Generate random key and secret
v_key := 'ck_' || encode(gen_random_bytes(24), 'hex');
v_secret := 'sk_' || encode(gen_random_bytes(24), 'hex');
-- Insert API key
INSERT INTO public.api_keys (
        user_id,
        key_name,
        api_key,
        api_secret,
        is_paid,
        rate_limit_per_day
    )
VALUES (
        p_user_id,
        p_key_name,
        v_key,
        v_secret,
        p_is_paid,
        CASE
            WHEN p_is_paid THEN 999999
            ELSE 100
        END
    );
RETURN QUERY
SELECT v_key,
    v_secret;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 4. FUNCTION: Validate API Key & Check Limits
-- =============================================================================
CREATE OR REPLACE FUNCTION validate_api_key(p_api_key VARCHAR) RETURNS TABLE(
        is_valid BOOLEAN,
        user_id UUID,
        key_id UUID,
        is_paid BOOLEAN,
        requests_remaining INTEGER,
        error_message TEXT
    ) AS $$
DECLARE v_key RECORD;
v_today DATE := CURRENT_DATE;
BEGIN -- Get API key
SELECT * INTO v_key
FROM public.api_keys
WHERE api_key = p_api_key
    AND is_active = true
    AND (
        expires_at IS NULL
        OR expires_at > NOW()
    );
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    NULL::UUID,
    NULL::UUID,
    false,
    0,
    'Invalid or expired API key';
RETURN;
END IF;
-- Reset daily counter if needed
IF v_key.last_reset_at < v_today THEN
UPDATE public.api_keys
SET requests_today = 0,
    last_reset_at = v_today
WHERE id = v_key.id;
v_key.requests_today := 0;
END IF;
-- Check rate limit (only for free tier)
IF NOT v_key.is_paid
AND v_key.requests_today >= v_key.rate_limit_per_day THEN RETURN QUERY
SELECT false,
    v_key.user_id,
    v_key.id,
    v_key.is_paid,
    0,
    'Rate limit exceeded. Upgrade to paid plan for unlimited requests.';
RETURN;
END IF;
-- Valid
RETURN QUERY
SELECT true,
    v_key.user_id,
    v_key.id,
    v_key.is_paid,
    CASE
        WHEN v_key.is_paid THEN 999999
        ELSE v_key.rate_limit_per_day - v_key.requests_today
    END,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. FUNCTION: Log API Usage & Bill
-- =============================================================================
CREATE OR REPLACE FUNCTION log_api_usage(
        p_api_key_id UUID,
        p_user_id UUID,
        p_endpoint VARCHAR,
        p_method VARCHAR,
        p_request_params JSONB DEFAULT NULL,
        p_response_status INTEGER DEFAULT 200,
        p_ip_address VARCHAR DEFAULT NULL
    ) RETURNS BOOLEAN AS $$
DECLARE v_key RECORD;
v_charge DECIMAL(10, 2);
v_wallet_id UUID;
BEGIN -- Get API key info
SELECT * INTO v_key
FROM public.api_keys
WHERE id = p_api_key_id;
-- Determine charge
IF v_key.is_paid THEN v_charge := v_key.cost_per_request;
ELSE v_charge := 0;
END IF;
-- Log usage
INSERT INTO public.api_usage_log (
        api_key_id,
        user_id,
        endpoint,
        method,
        request_params,
        response_status,
        was_charged,
        charge_amount,
        ip_address
    )
VALUES (
        p_api_key_id,
        p_user_id,
        p_endpoint,
        p_method,
        p_request_params,
        p_response_status,
        v_charge > 0,
        v_charge,
        p_ip_address
    );
-- Update API key counters
UPDATE public.api_keys
SET total_requests = total_requests + 1,
    requests_today = requests_today + 1,
    total_cost = total_cost + v_charge,
    last_request_at = NOW()
WHERE id = p_api_key_id;
-- Deduct from wallet if paid
IF v_charge > 0 THEN -- Get user's wallet
SELECT id INTO v_wallet_id
FROM public.wallets
WHERE user_id = p_user_id;
IF v_wallet_id IS NOT NULL THEN -- Deduct balance
PERFORM wallet_debit(
    v_wallet_id,
    (v_charge * 100)::INTEGER,
    -- Convert to cents
    'API usage charge for ' || p_endpoint,
    'api_charge_' || gen_random_uuid()::TEXT
);
END IF;
END IF;
RETURN true;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own API keys" ON public.api_keys FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own API keys" ON public.api_keys FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON public.api_keys FOR
UPDATE USING (auth.uid() = user_id);
ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own API usage" ON public.api_usage_log FOR
SELECT USING (auth.uid() = user_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Public API System created!';
RAISE NOTICE '🔑 API key management enabled';
RAISE NOTICE '📊 Usage metering & billing ready';
RAISE NOTICE '💰 Free: 100 req/day, Paid: Rp 50/req';
RAISE NOTICE '🚀 API economy unlocked!';
END $$;