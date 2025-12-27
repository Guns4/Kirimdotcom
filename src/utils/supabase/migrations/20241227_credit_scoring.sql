-- ============================================================================
-- CREDIT SCORING ENGINE
-- Phase 206-210: AI-Based Risk Assessment
-- ============================================================================
-- ============================================================================
-- 1. CREDIT SCORE HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.credit_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Seller info
    user_id UUID NOT NULL,
    -- Score details
    score INTEGER NOT NULL CHECK (
        score >= 0
        AND score <= 850
    ),
    previous_score INTEGER,
    score_change INTEGER GENERATED ALWAYS AS (score - COALESCE(previous_score, score)) STORED,
    -- Risk classification
    risk_category VARCHAR(20) NOT NULL,
    -- 'excellent', 'good', 'fair', 'poor', 'very_poor'
    -- Score breakdown (weights that contributed to score)
    score_factors JSONB NOT NULL,
    -- Example: {
    --   "order_success_rate": {"score": 350, "weight": 40},
    --   "dispute_rate": {"score": 250, "weight": 30},
    --   "payment_history": {"score": 150, "weight": 20},
    --   "account_age": {"score": 100, "weight": 10}
    -- }
    -- Analysis summary
    strengths TEXT [],
    weaknesses TEXT [],
    recommendations TEXT [],
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    -- Score expires after certain period
    calculation_method VARCHAR(50) DEFAULT 'v1.0'
);
CREATE INDEX IF NOT EXISTS idx_credit_score_user ON public.credit_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_score_date ON public.credit_score_history(calculated_at);
-- ============================================================================
-- 2. SELLER PERFORMANCE METRICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seller_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Seller info
    user_id UUID NOT NULL UNIQUE,
    -- Order metrics
    total_orders INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    pending_orders INTEGER DEFAULT 0,
    -- Success rate
    delivery_success_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN total_orders > 0 THEN ROUND(
                (
                    successful_deliveries::DECIMAL / total_orders * 100
                ),
                2
            )
            ELSE 0
        END
    ) STORED,
    -- Dispute metrics
    total_disputes INTEGER DEFAULT 0,
    resolved_disputes INTEGER DEFAULT 0,
    pending_disputes INTEGER DEFAULT 0,
    -- Dispute rate
    dispute_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN total_orders > 0 THEN ROUND(
                (total_disputes::DECIMAL / total_orders * 100),
                2
            )
            ELSE 0
        END
    ) STORED,
    -- Payment metrics (for PayLater users)
    total_credit_used DECIMAL(15, 2) DEFAULT 0.00,
    total_repaid DECIMAL(15, 2) DEFAULT 0.00,
    on_time_payments INTEGER DEFAULT 0,
    late_payments INTEGER DEFAULT 0,
    -- Payment history score
    payment_reliability DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN (on_time_payments + late_payments) > 0 THEN ROUND(
                (
                    on_time_payments::DECIMAL / (on_time_payments + late_payments) * 100
                ),
                2
            )
            ELSE 100
        END
    ) STORED,
    -- Account age (in days)
    account_age_days INTEGER DEFAULT 0,
    -- Last updated
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seller_metrics_user ON public.seller_performance_metrics(user_id);
-- ============================================================================
-- 3. CREDIT SCORING FUNCTIONS
-- ============================================================================
-- Calculate credit score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_credit_score(p_user_id UUID) RETURNS TABLE(
        score INTEGER,
        risk_category VARCHAR,
        score_factors JSONB,
        strengths TEXT [],
        weaknesses TEXT []
    ) AS $$
DECLARE v_metrics RECORD;
v_score INTEGER := 0;
v_risk_category VARCHAR;
v_factors JSONB;
v_strengths TEXT [] := ARRAY []::TEXT [];
v_weaknesses TEXT [] := ARRAY []::TEXT [];
-- Score components (max scores)
v_order_score INTEGER;
v_dispute_score INTEGER;
v_payment_score INTEGER;
v_age_score INTEGER;
BEGIN -- Get seller metrics
SELECT * INTO v_metrics
FROM public.seller_performance_metrics
WHERE user_id = p_user_id;
IF NOT FOUND THEN -- No data, return minimum score
RETURN QUERY
SELECT 300::INTEGER,
    'unrated'::VARCHAR,
    '{}'::JSONB,
    ARRAY ['New seller']::TEXT [],
    ARRAY ['No transaction history']::TEXT [];
RETURN;
END IF;
-- 1. ORDER SUCCESS RATE (40% weight, max 340 points)
v_order_score := CASE
    WHEN v_metrics.total_orders = 0 THEN 200 -- New seller baseline
    WHEN v_metrics.delivery_success_rate >= 95 THEN 340
    WHEN v_metrics.delivery_success_rate >= 90 THEN 300
    WHEN v_metrics.delivery_success_rate >= 85 THEN 260
    WHEN v_metrics.delivery_success_rate >= 80 THEN 220
    WHEN v_metrics.delivery_success_rate >= 70 THEN 180
    ELSE 140
END;
IF v_metrics.delivery_success_rate >= 90 THEN v_strengths := array_append(v_strengths, 'Excellent delivery success rate');
ELSIF v_metrics.delivery_success_rate < 80 THEN v_weaknesses := array_append(v_weaknesses, 'Low delivery success rate');
END IF;
-- 2. DISPUTE RATE (30% weight, max 255 points)
v_dispute_score := CASE
    WHEN v_metrics.total_disputes = 0 THEN 255
    WHEN v_metrics.dispute_rate <= 2 THEN 240
    WHEN v_metrics.dispute_rate <= 5 THEN 210
    WHEN v_metrics.dispute_rate <= 10 THEN 170
    WHEN v_metrics.dispute_rate <= 15 THEN 130
    ELSE 85
END;
IF v_metrics.dispute_rate <= 5 THEN v_strengths := array_append(v_strengths, 'Very low dispute rate');
ELSIF v_metrics.dispute_rate > 10 THEN v_weaknesses := array_append(v_weaknesses, 'High dispute rate');
END IF;
-- 3. PAYMENT HISTORY (20% weight, max 170 points)
v_payment_score := CASE
    WHEN v_metrics.on_time_payments + v_metrics.late_payments = 0 THEN 140 -- No credit history
    WHEN v_metrics.payment_reliability >= 95 THEN 170
    WHEN v_metrics.payment_reliability >= 90 THEN 150
    WHEN v_metrics.payment_reliability >= 80 THEN 120
    WHEN v_metrics.payment_reliability >= 70 THEN 90
    ELSE 60
END;
IF v_metrics.payment_reliability >= 90 THEN v_strengths := array_append(v_strengths, 'Excellent payment history');
ELSIF v_metrics.payment_reliability < 80 THEN v_weaknesses := array_append(v_weaknesses, 'Late payment issues');
END IF;
-- 4. ACCOUNT AGE (10% weight, max 85 points)
v_age_score := CASE
    WHEN v_metrics.account_age_days >= 365 THEN 85
    WHEN v_metrics.account_age_days >= 180 THEN 70
    WHEN v_metrics.account_age_days >= 90 THEN 55
    WHEN v_metrics.account_age_days >= 30 THEN 40
    ELSE 25
END;
IF v_metrics.account_age_days >= 365 THEN v_strengths := array_append(v_strengths, 'Established account (1+ year)');
ELSIF v_metrics.account_age_days < 90 THEN v_weaknesses := array_append(v_weaknesses, 'New account (< 3 months)');
END IF;
-- Calculate total score
v_score := v_order_score + v_dispute_score + v_payment_score + v_age_score;
-- Determine risk category
v_risk_category := CASE
    WHEN v_score >= 750 THEN 'excellent'
    WHEN v_score >= 700 THEN 'good'
    WHEN v_score >= 650 THEN 'fair'
    WHEN v_score >= 600 THEN 'poor'
    ELSE 'very_poor'
END;
-- Build factors JSON
v_factors := jsonb_build_object(
    'order_success',
    jsonb_build_object(
        'score',
        v_order_score,
        'weight',
        40,
        'rate',
        v_metrics.delivery_success_rate
    ),
    'dispute_rate',
    jsonb_build_object(
        'score',
        v_dispute_score,
        'weight',
        30,
        'rate',
        v_metrics.dispute_rate
    ),
    'payment_history',
    jsonb_build_object(
        'score',
        v_payment_score,
        'weight',
        20,
        'reliability',
        v_metrics.payment_reliability
    ),
    'account_age',
    jsonb_build_object(
        'score',
        v_age_score,
        'weight',
        10,
        'days',
        v_metrics.account_age_days
    )
);
RETURN QUERY
SELECT v_score,
    v_risk_category,
    v_factors,
    v_strengths,
    v_weaknesses;
END;
$$ LANGUAGE plpgsql;
-- Update seller metrics from orders and disputes
CREATE OR REPLACE FUNCTION update_seller_metrics(p_user_id UUID) RETURNS VOID AS $$
DECLARE v_account_created DATE;
BEGIN -- Get account creation date (assuming from auth or users table)
-- For now, using a placeholder
v_account_created := CURRENT_DATE - INTERVAL '180 days';
-- Upsert metrics
INSERT INTO public.seller_performance_metrics (
        user_id,
        total_orders,
        successful_deliveries,
        failed_deliveries,
        total_disputes,
        account_age_days,
        last_calculated_at
    )
VALUES (
        p_user_id,
        0,
        -- Will be updated with actual order data
        0,
        0,
        0,
        (CURRENT_DATE - v_account_created)::INTEGER,
        NOW()
    ) ON CONFLICT (user_id) DO
UPDATE
SET last_calculated_at = NOW(),
    account_age_days = (CURRENT_DATE - v_account_created)::INTEGER;
-- TODO: Add actual order and dispute aggregation queries here
-- This would query from orders and disputes tables
END;
$$ LANGUAGE plpgsql;
-- Recalculate and store credit score
CREATE OR REPLACE FUNCTION recalculate_credit_score(p_user_id UUID) RETURNS UUID AS $$
DECLARE v_score_record RECORD;
v_previous_score INTEGER;
v_history_id UUID;
BEGIN -- Update metrics first
PERFORM update_seller_metrics(p_user_id);
-- Get previous score
SELECT score INTO v_previous_score
FROM public.credit_score_history
WHERE user_id = p_user_id
ORDER BY calculated_at DESC
LIMIT 1;
-- Calculate new score
SELECT * INTO v_score_record
FROM calculate_credit_score(p_user_id);
-- Insert into history
INSERT INTO public.credit_score_history (
        user_id,
        score,
        previous_score,
        risk_category,
        score_factors,
        strengths,
        weaknesses,
        valid_until
    )
VALUES (
        p_user_id,
        v_score_record.score,
        v_previous_score,
        v_score_record.risk_category,
        v_score_record.score_factors,
        v_score_record.strengths,
        v_score_record.weaknesses,
        NOW() + INTERVAL '30 days'
    )
RETURNING id INTO v_history_id;
-- Update PayLater credit account if exists
UPDATE public.paylater_seller_credit
SET credit_score = v_score_record.score,
    risk_category = v_score_record.risk_category,
    updated_at = NOW()
WHERE user_id = p_user_id;
RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================
ALTER TABLE public.credit_score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own credit score" ON public.credit_score_history FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.seller_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own metrics" ON public.seller_performance_metrics FOR
SELECT USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Credit Scoring Engine created successfully!';
RAISE NOTICE '📊 Tables: credit_score_history, seller_performance_metrics';
RAISE NOTICE '🎯 Score range: 0-850 (FICO-like scale)';
RAISE NOTICE '⚖️ Weights: Orders 40%%, Disputes 30%%, Payment 20%%, Age 10%%';
RAISE NOTICE '🔐 Functions: calculate_credit_score, recalculate_credit_score';
END $$;