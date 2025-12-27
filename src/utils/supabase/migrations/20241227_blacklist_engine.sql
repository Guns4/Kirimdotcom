-- ============================================================================
-- COMMUNITY BLACKLIST / FRAUD PREVENTION ENGINE
-- Phase 401-405: Seller Protection & Customer Risk Checking
-- ============================================================================
-- ============================================================================
-- 1. BLACKLIST REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blacklist_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reported customer
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    -- Report details
    reason VARCHAR(50) NOT NULL,
    -- 'reject_cod', 'return_abuse', 'fake_order', 'rude', 'other'
    description TEXT,
    -- Evidence
    proof_image_url TEXT,
    -- Screenshot of chat/proof
    order_reference VARCHAR(255),
    -- AWB or order ID if any
    -- Reporter
    reporter_id UUID NOT NULL,
    reporter_business_name VARCHAR(255),
    -- Verification
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'verified', 'rejected', 'duplicate'
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON public.blacklist_reports(customer_phone);
CREATE INDEX IF NOT EXISTS idx_blacklist_reporter ON public.blacklist_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_status ON public.blacklist_reports(status);
CREATE INDEX IF NOT EXISTS idx_blacklist_reason ON public.blacklist_reports(reason);
-- ============================================================================
-- 2. CUSTOMER RISK SCORES (Cached)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Customer identifier
    customer_phone VARCHAR(20) UNIQUE NOT NULL,
    -- Risk metrics
    total_reports INTEGER DEFAULT 0,
    verified_reports INTEGER DEFAULT 0,
    -- Breakdown by reason
    reject_cod_count INTEGER DEFAULT 0,
    return_abuse_count INTEGER DEFAULT 0,
    fake_order_count INTEGER DEFAULT 0,
    rude_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'unknown',
    -- 'safe', 'caution', 'danger', 'unknown'
    risk_score INTEGER DEFAULT 0,
    -- 0-100
    -- Timestamps
    last_report_date TIMESTAMPTZ,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risk_scores_phone ON public.customer_risk_scores(customer_phone);
CREATE INDEX IF NOT EXISTS idx_risk_scores_level ON public.customer_risk_scores(risk_level);
-- ============================================================================
-- 3. FUNCTION: Calculate Risk Score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_customer_risk(p_customer_phone VARCHAR) RETURNS TABLE(
        total_reports INTEGER,
        risk_level VARCHAR,
        risk_score INTEGER,
        breakdown JSONB
    ) AS $$
DECLARE v_total INTEGER;
v_verified INTEGER;
v_reject_cod INTEGER;
v_return_abuse INTEGER;
v_fake_order INTEGER;
v_rude INTEGER;
v_other INTEGER;
v_score INTEGER;
v_level VARCHAR;
BEGIN -- Count all reports (including pending)
SELECT COUNT(*) INTO v_total
FROM public.blacklist_reports
WHERE customer_phone = p_customer_phone;
-- Count verified reports only
SELECT COUNT(*) INTO v_verified
FROM public.blacklist_reports
WHERE customer_phone = p_customer_phone
    AND status = 'verified';
-- Breakdown by reason
SELECT COUNT(*) FILTER (
        WHERE reason = 'reject_cod'
    ),
    COUNT(*) FILTER (
        WHERE reason = 'return_abuse'
    ),
    COUNT(*) FILTER (
        WHERE reason = 'fake_order'
    ),
    COUNT(*) FILTER (
        WHERE reason = 'rude'
    ),
    COUNT(*) FILTER (
        WHERE reason = 'other'
    ) INTO v_reject_cod,
    v_return_abuse,
    v_fake_order,
    v_rude,
    v_other
FROM public.blacklist_reports
WHERE customer_phone = p_customer_phone
    AND status = 'verified';
-- Calculate risk score (weighted)
v_score := (v_reject_cod * 25) + -- COD rejection is serious
(v_return_abuse * 20) + -- Return abuse
(v_fake_order * 30) + -- Fake orders are very serious
(v_rude * 5) + -- Rudeness is minor
(v_other * 10);
-- Other issues
-- Cap at 100
IF v_score > 100 THEN v_score := 100;
END IF;
-- Determine risk level
IF v_total = 0 THEN v_level := 'unknown';
ELSIF v_verified >= 5
OR v_score >= 50 THEN v_level := 'danger';
ELSIF v_verified >= 2
OR v_score >= 25 THEN v_level := 'caution';
ELSE v_level := 'safe';
END IF;
-- Upsert to cache
INSERT INTO public.customer_risk_scores (
        customer_phone,
        total_reports,
        verified_reports,
        reject_cod_count,
        return_abuse_count,
        fake_order_count,
        rude_count,
        other_count,
        risk_level,
        risk_score,
        calculated_at
    )
VALUES (
        p_customer_phone,
        v_total,
        v_verified,
        v_reject_cod,
        v_return_abuse,
        v_fake_order,
        v_rude,
        v_other,
        v_level,
        v_score,
        NOW()
    ) ON CONFLICT (customer_phone) DO
UPDATE
SET total_reports = v_total,
    verified_reports = v_verified,
    reject_cod_count = v_reject_cod,
    return_abuse_count = v_return_abuse,
    fake_order_count = v_fake_order,
    rude_count = v_rude,
    other_count = v_other,
    risk_level = v_level,
    risk_score = v_score,
    calculated_at = NOW();
-- Return results
RETURN QUERY
SELECT v_total,
    v_level,
    v_score,
    jsonb_build_object(
        'reject_cod',
        v_reject_cod,
        'return_abuse',
        v_return_abuse,
        'fake_order',
        v_fake_order,
        'rude',
        v_rude,
        'other',
        v_other
    );
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. FUNCTION: Submit Report
-- ============================================================================
CREATE OR REPLACE FUNCTION submit_blacklist_report(
        p_reporter_id UUID,
        p_customer_phone VARCHAR,
        p_customer_name VARCHAR,
        p_reason VARCHAR,
        p_description TEXT,
        p_proof_url TEXT
    ) RETURNS UUID AS $$
DECLARE v_report_id UUID;
BEGIN -- Create report
INSERT INTO public.blacklist_reports (
        reporter_id,
        customer_phone,
        customer_name,
        reason,
        description,
        proof_image_url,
        status
    )
VALUES (
        p_reporter_id,
        p_customer_phone,
        p_customer_name,
        p_reason,
        p_description,
        p_proof_url,
        'pending' -- Requires verification
    )
RETURNING id INTO v_report_id;
-- Recalculate risk score
PERFORM calculate_customer_risk(p_customer_phone);
RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================
ALTER TABLE public.blacklist_reports ENABLE ROW LEVEL SECURITY;
-- Users can view verified reports
CREATE POLICY "Users can view verified reports" ON public.blacklist_reports FOR
SELECT USING (
        status = 'verified'
        OR auth.uid() = reporter_id
    );
-- Users can submit reports
CREATE POLICY "Users can submit reports" ON public.blacklist_reports FOR
INSERT WITH CHECK (auth.uid() = reporter_id);
-- Users can view their own reports
CREATE POLICY "Users can update own reports" ON public.blacklist_reports FOR
UPDATE USING (auth.uid() = reporter_id);
ALTER TABLE public.customer_risk_scores ENABLE ROW LEVEL SECURITY;
-- Everyone can view risk scores (public data)
CREATE POLICY "Risk scores are public" ON public.customer_risk_scores FOR
SELECT USING (true);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Blacklist Engine created successfully!';
RAISE NOTICE '🛡️ Customer risk checking enabled';
RAISE NOTICE '📊 Risk scoring algorithm implemented';
RAISE NOTICE '🚨 Community fraud prevention ready!';
END $$;