-- ============================================
-- GOD MODE PHASE 901-1000: AI INTELLIGENCE
-- AI Cost Tracking, Chatbot Training, Fraud Detection
-- ============================================
-- AI USAGE LOGS TABLE (Cost & Token Tracking)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature VARCHAR(50) CHECK (
        feature IN (
            'CHATBOT',
            'ETA_PREDICTION',
            'FRAUD_DETECTION',
            'CONTENT_WRITER',
            'IMAGE_ANALYSIS'
        )
    ),
    model VARCHAR(50) DEFAULT 'gpt-4o',
    -- gpt-4o, gpt-3.5-turbo, claude-3-sonnet, etc.
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    user_id UUID REFERENCES public.users(id),
    request_data JSONB,
    -- Store prompt/query for debugging
    response_data JSONB,
    -- Store AI response
    processing_time_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- AI CHAT HISTORY TABLE (Chatbot Training & RLHF)
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    is_helpful BOOLEAN,
    feedback_reason TEXT,
    admin_correction TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (
        status IN (
            'ACTIVE',
            'PENDING_REVIEW',
            'CORRECTED',
            'ARCHIVED'
        )
    ),
    conversation_id UUID,
    -- Group related messages
    model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- FRAUD ALERTS TABLE (AI Risk Scoring)
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID,
    user_id UUID REFERENCES public.users(id),
    transaction_type VARCHAR(50),
    -- TOPUP, WITHDRAWAL, ORDER
    amount DECIMAL(15, 2),
    risk_score INT CHECK (
        risk_score >= 0
        AND risk_score <= 100
    ),
    risk_factors JSONB,
    -- ["IP_MISMATCH", "HIGH_VALUE", "SUSPICIOUS_PATTERN"]
    ai_verdict VARCHAR(20) CHECK (ai_verdict IN ('BLOCK', 'FLAG', 'ALLOW')),
    admin_override VARCHAR(20) CHECK (
        admin_override IN ('APPROVED', 'REJECTED', 'PENDING')
    ),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON public.ai_usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_cost ON public.ai_usage_logs(cost_usd DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_status ON public.ai_chat_history(status);
CREATE INDEX IF NOT EXISTS idx_chat_history_helpful ON public.ai_chat_history(is_helpful);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_score ON public.fraud_alerts(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_verdict ON public.fraud_alerts(ai_verdict);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_override ON public.fraud_alerts(admin_override);
-- Row Level Security
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "Users can view own chat history" ON public.ai_chat_history;
CREATE POLICY "Users can view own chat history" ON public.ai_chat_history FOR
SELECT USING (auth.uid() = user_id);
-- Function to calculate AI costs summary
CREATE OR REPLACE FUNCTION get_ai_cost_summary(
        p_start_date DATE DEFAULT NULL,
        p_end_date DATE DEFAULT NULL
    ) RETURNS TABLE (
        total_cost_usd DECIMAL,
        total_requests INT,
        total_tokens BIGINT,
        cost_by_feature JSONB
    ) AS $$
DECLARE v_start_date DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN RETURN QUERY
SELECT COALESCE(SUM(cost_usd), 0) as total_cost_usd,
    COUNT(*)::INT as total_requests,
    COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
    jsonb_object_agg(
        feature,
        jsonb_build_object(
            'requests',
            COUNT(*),
            'cost',
            COALESCE(SUM(cost_usd), 0),
            'tokens',
            COALESCE(SUM(input_tokens + output_tokens), 0)
        )
    ) as cost_by_feature
FROM public.ai_usage_logs
WHERE created_at::DATE BETWEEN v_start_date AND v_end_date
GROUP BY feature;
END;
$$ LANGUAGE plpgsql;
-- Function to get pending chatbot reviews
CREATE OR REPLACE FUNCTION get_pending_chat_reviews() RETURNS TABLE (
        id UUID,
        user_query TEXT,
        ai_response TEXT,
        feedback_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE
    ) AS $$ BEGIN RETURN QUERY
SELECT c.id,
    c.user_query,
    c.ai_response,
    c.feedback_reason,
    c.created_at
FROM public.ai_chat_history c
WHERE c.is_helpful = false
    OR c.status = 'PENDING_REVIEW'
ORDER BY c.created_at DESC
LIMIT 100;
END;
$$ LANGUAGE plpgsql;
-- Function to get high-risk fraud alerts
CREATE OR REPLACE FUNCTION get_high_risk_transactions() RETURNS TABLE (
        id UUID,
        transaction_id UUID,
        user_id UUID,
        amount DECIMAL,
        risk_score INT,
        risk_factors JSONB,
        ai_verdict VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE
    ) AS $$ BEGIN RETURN QUERY
SELECT f.id,
    f.transaction_id,
    f.user_id,
    f.amount,
    f.risk_score,
    f.risk_factors,
    f.ai_verdict,
    f.created_at
FROM public.fraud_alerts f
WHERE f.risk_score > 80
    AND f.admin_override = 'PENDING'
ORDER BY f.risk_score DESC,
    f.created_at DESC
LIMIT 50;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.ai_usage_logs IS 'AI feature usage and cost tracking for OpenAI/Claude API calls';
COMMENT ON TABLE public.ai_chat_history IS 'Chatbot conversation history with RLHF feedback for training';
COMMENT ON TABLE public.fraud_alerts IS 'AI-powered fraud detection alerts with risk scoring';