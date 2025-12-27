-- ============================================================================
-- INSURANCE MODULE - AUTO-CLAIM SYSTEM
-- Phase 216-225: Package Insurance & Claims
-- ============================================================================
-- ============================================================================
-- 1. INSURANCE POLICIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Policy details
    policy_name VARCHAR(255) NOT NULL,
    policy_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    -- Coverage
    coverage_type VARCHAR(50) NOT NULL,
    -- 'lost', 'damaged', 'delayed', 'all'
    max_coverage_amount DECIMAL(12, 2) NOT NULL,
    -- Premium
    premium_type VARCHAR(20) NOT NULL,
    -- 'percentage', 'fixed'
    premium_rate DECIMAL(5, 2),
    -- Percentage if percentage type
    premium_fixed DECIMAL(10, 2),
    -- Fixed amount if fixed type
    -- Rules
    min_declared_value DECIMAL(12, 2) DEFAULT 0,
    max_declared_value DECIMAL(12, 2),
    -- Claim limits
    max_claims_per_month INTEGER DEFAULT 3,
    max_refund_percentage DECIMAL(5, 2) DEFAULT 100.00,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_code ON public.insurance_policies(policy_code);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_active ON public.insurance_policies(is_active);
-- ============================================================================
-- 2. PACKAGE INSURANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.package_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Package info
    tracking_number VARCHAR(100) NOT NULL,
    order_id UUID,
    user_id UUID NOT NULL,
    -- Policy
    policy_id UUID NOT NULL REFERENCES public.insurance_policies(id),
    -- Insurance details
    declared_value DECIMAL(12, 2) NOT NULL,
    premium_paid DECIMAL(10, 2) NOT NULL,
    coverage_amount DECIMAL(12, 2) NOT NULL,
    -- Package details
    courier VARCHAR(50) NOT NULL,
    destination TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    -- 'active', 'claimed', 'expired', 'cancelled'
    -- Claim info (if applicable)
    claim_id UUID,
    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_package_insurance_tracking ON public.package_insurance(tracking_number);
CREATE INDEX IF NOT EXISTS idx_package_insurance_user ON public.package_insurance(user_id);
CREATE INDEX IF NOT EXISTS idx_package_insurance_status ON public.package_insurance(status);
CREATE INDEX IF NOT EXISTS idx_package_insurance_order ON public.package_insurance(order_id);
-- ============================================================================
-- 3. INSURANCE CLAIMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Insurance reference
    package_insurance_id UUID NOT NULL REFERENCES public.package_insurance(id),
    tracking_number VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    -- Claim details
    claim_type VARCHAR(50) NOT NULL,
    -- 'lost', 'damaged', 'delayed'
    claim_amount DECIMAL(12, 2) NOT NULL,
    -- Evidence
    description TEXT NOT NULL,
    evidence_urls TEXT [],
    -- Photos, documents
    -- Auto-detection data
    auto_detected BOOLEAN DEFAULT false,
    detection_reason TEXT,
    tracking_data JSONB,
    -- Store problematic tracking events
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- Status: 'pending', 'under_review', 'approved', 'rejected', 'paid'
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    -- Approval
    approved_amount DECIMAL(12, 2),
    rejection_reason TEXT,
    -- Payment
    paid_via VARCHAR(50),
    -- 'wallet', 'bank_transfer'
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(255),
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_package ON public.insurance_claims(package_insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user ON public.insurance_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_tracking ON public.insurance_claims(tracking_number);
-- ============================================================================
-- 4. CLAIM AUTO-DETECTION RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.claim_detection_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Rule details
    rule_name VARCHAR(255) NOT NULL,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    -- Trigger conditions
    claim_type VARCHAR(50) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    -- Examples: 'status_not_moving_7days', 'return_to_sender', 'delivery_failed_3times'
    -- Detection logic (JSONB for flexibility)
    conditions JSONB NOT NULL,
    -- Example: {"status": "RETURN", "days_stuck": 7, "failed_attempts": 3}
    -- Auto-approve settings
    auto_approve BOOLEAN DEFAULT false,
    auto_approve_max_amount DECIMAL(12, 2),
    -- Priority
    priority INTEGER DEFAULT 5,
    -- Higher = checked first
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claim_rules_code ON public.claim_detection_rules(rule_code);
CREATE INDEX IF NOT EXISTS idx_claim_rules_active ON public.claim_detection_rules(is_active, priority);
-- ============================================================================
-- 5. AUTO-CLAIM DETECTION FUNCTIONS
-- ============================================================================
-- Check if tracking data indicates a claimable event
CREATE OR REPLACE FUNCTION check_auto_claim_conditions(
        p_tracking_number VARCHAR,
        p_tracking_data JSONB
    ) RETURNS TABLE(
        should_claim BOOLEAN,
        claim_type VARCHAR,
        reason TEXT,
        rule_code VARCHAR
    ) AS $$
DECLARE v_rule RECORD;
v_latest_status VARCHAR;
v_days_since_update INTEGER;
BEGIN -- Extract latest status from tracking data
-- This is a simplified version - actual implementation depends on tracking data structure
v_latest_status := p_tracking_data->>'latest_status';
v_days_since_update := (
    NOW() - (p_tracking_data->>'last_update_time')::TIMESTAMPTZ
)::INTEGER;
-- Check all active rules by priority
FOR v_rule IN
SELECT *
FROM public.claim_detection_rules
WHERE is_active = true
ORDER BY priority DESC LOOP -- Rule 1: Package not moving for 7+ days
    IF v_rule.rule_code = 'STUCK_7_DAYS'
    AND v_days_since_update >= 7 THEN RETURN QUERY
SELECT true,
    'lost'::VARCHAR,
    format('Package stuck for %s days', v_days_since_update),
    v_rule.rule_code;
RETURN;
END IF;
-- Rule 2: Return to sender
IF v_rule.rule_code = 'RETURN_TO_SENDER'
AND v_latest_status ILIKE '%RETURN%' THEN RETURN QUERY
SELECT true,
    'lost'::VARCHAR,
    'Package returned to sender',
    v_rule.rule_code;
RETURN;
END IF;
-- Rule 3: Multiple delivery failures
IF v_rule.rule_code = 'FAILED_DELIVERY'
AND v_latest_status ILIKE '%FAILED%' THEN RETURN QUERY
SELECT true,
    'delayed'::VARCHAR,
    'Multiple delivery failures detected',
    v_rule.rule_code;
RETURN;
END IF;
END LOOP;
-- No claim condition met
RETURN QUERY
SELECT false,
    NULL::VARCHAR,
    NULL::TEXT,
    NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;
-- Auto-create claim from detection
CREATE OR REPLACE FUNCTION auto_create_claim(
        p_package_insurance_id UUID,
        p_claim_type VARCHAR,
        p_reason TEXT,
        p_tracking_data JSONB
    ) RETURNS UUID AS $$
DECLARE v_claim_id UUID;
v_insurance RECORD;
BEGIN -- Get insurance details
SELECT * INTO v_insurance
FROM public.package_insurance
WHERE id = p_package_insurance_id
    AND status = 'active';
IF NOT FOUND THEN RAISE EXCEPTION 'Insurance not found or not active';
END IF;
v_claim_id := uuid_generate_v4();
-- Create claim
INSERT INTO public.insurance_claims (
        id,
        package_insurance_id,
        tracking_number,
        user_id,
        claim_type,
        claim_amount,
        description,
        auto_detected,
        detection_reason,
        tracking_data,
        status
    )
VALUES (
        v_claim_id,
        p_package_insurance_id,
        v_insurance.tracking_number,
        v_insurance.user_id,
        p_claim_type,
        v_insurance.coverage_amount,
        format('Auto-detected: %s', p_reason),
        true,
        p_reason,
        p_tracking_data,
        'pending' -- Requires review unless auto-approved
    );
-- Update insurance status
UPDATE public.package_insurance
SET status = 'claimed',
    claim_id = v_claim_id,
    updated_at = NOW()
WHERE id = p_package_insurance_id;
RETURN v_claim_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. SEED DATA: Default Policy & Rules
-- ============================================================================
-- Default policy
INSERT INTO public.insurance_policies (
        policy_name,
        policy_code,
        description,
        coverage_type,
        max_coverage_amount,
        premium_type,
        premium_rate,
        is_active
    )
VALUES (
        'Paket Lengkap - All Risk',
        'ALL_RISK_BASIC',
        'Perlindungan menyeluruh untuk paket hilang, rusak, atau terlambat',
        'all',
        5000000.00,
        'percentage',
        1.50,
        -- 1.5% of declared value
        true
    ) ON CONFLICT (policy_code) DO NOTHING;
-- Detection rules
INSERT INTO public.claim_detection_rules (
        rule_name,
        rule_code,
        claim_type,
        trigger_event,
        conditions,
        auto_approve,
        priority,
        is_active
    )
VALUES (
        'Paket Stuck 7 Hari',
        'STUCK_7_DAYS',
        'lost',
        'no_update_7_days',
        '{"min_days": 7}'::jsonb,
        false,
        10,
        true
    ),
    (
        'Return to Sender',
        'RETURN_TO_SENDER',
        'lost',
        'return_status',
        '{"status_contains": "RETURN"}'::jsonb,
        false,
        9,
        true
    ),
    (
        'Gagal Kirim Berulang',
        'FAILED_DELIVERY',
        'delayed',
        'failed_delivery',
        '{"min_failures": 2}'::jsonb,
        false,
        8,
        true
    ) ON CONFLICT (rule_code) DO NOTHING;
-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE public.package_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own insurance" ON public.package_insurance FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own claims" ON public.insurance_claims FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own claims" ON public.insurance_claims FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Insurance Module created successfully!';
RAISE NOTICE '🛡️ Tables: policies, package_insurance, claims, detection_rules';
RAISE NOTICE '🤖 Auto-detection: AI-based claim triggers';
RAISE NOTICE '📦 Integration: Tracking data analysis';
RAISE NOTICE '💰 Default policy: 1.5%% premium, up to Rp 5M coverage';
END $$;