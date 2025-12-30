-- 1. Fraud Alerts Table
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0, -- 0-100
    flag_type TEXT NOT NULL, -- 'Suspicious Activity', 'Account Takeover', 'Card Testing'
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_resolved ON public.fraud_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_detected ON public.fraud_alerts(detected_at);

-- 2. Rules Engine Function
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns()
RETURNS TRIGGER AS $$
DECLARE
    v_fail_count INTEGER;
    v_risk_score INTEGER := 0;
    v_flag_type TEXT := '';
    v_description TEXT := '';
BEGIN
    -- RULE 1: Rapid Transaction Failures (5+ failed attempts in 1 minute)
    IF (TG_TABLE_NAME = 'transactions' AND NEW.status = 'failed') THEN
        SELECT count(*) INTO v_fail_count
        FROM public.transactions
        WHERE user_id = NEW.user_id 
          AND status = 'failed' 
          AND created_at > (now() - interval '1 minute');
        
        -- If 5 or more failures (including current)
        IF v_fail_count >= 4 THEN
            v_risk_score := 50;
            v_flag_type := 'Card Testing';
            v_description := 'High velocity of failed transactions detected (Potential card testing attack)';
            
            INSERT INTO public.fraud_alerts (user_id, risk_score, flag_type, description, metadata)
            VALUES (NEW.user_id, v_risk_score, v_flag_type, v_description, 
                    jsonb_build_object('transaction_id', NEW.id, 'fail_count', v_fail_count));
            
            -- Check if account should be frozen
            PERFORM public.check_and_freeze_account(NEW.user_id);
        END IF;
    END IF;

    -- RULE 2: Large Transaction Amount (Potential fraud)
    IF (TG_TABLE_NAME = 'transactions' AND NEW.amount > 10000000) THEN
        v_risk_score := 30;
        v_flag_type := 'Suspicious Activity';
        v_description := 'Unusually large transaction amount detected';
        
        INSERT INTO public.fraud_alerts (user_id, risk_score, flag_type, description, metadata)
        VALUES (NEW.user_id, v_risk_score, v_flag_type, v_description,
                jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount));
        
        PERFORM public.check_and_freeze_account(NEW.user_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Account Freeze Mechanism
CREATE OR REPLACE FUNCTION public.check_and_freeze_account(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_total_risk INTEGER;
BEGIN
    -- Sum unresolved risk scores
    SELECT COALESCE(SUM(risk_score), 0) INTO v_total_risk
    FROM public.fraud_alerts
    WHERE user_id = p_user_id AND resolved = false;

    -- If cumulative risk >= 100, freeze account
    IF v_total_risk >= 100 THEN
        -- Update profile status
        UPDATE public.profiles 
        SET is_frozen = true, 
            status = 'SUSPENDED'
        WHERE id = p_user_id;

        -- Optional: Log the freeze action
        INSERT INTO public.fraud_alerts (
            user_id, 
            risk_score, 
            flag_type, 
            description,
            metadata
        )
        VALUES (
            p_user_id, 
            0, 
            'Account Frozen', 
            'Account automatically frozen due to cumulative risk score exceeding threshold',
            jsonb_build_object('total_risk', v_total_risk, 'threshold', 100)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers
DROP TRIGGER IF EXISTS trg_fraud_check_transactions ON public.transactions;
CREATE TRIGGER trg_fraud_check_transactions
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.detect_fraud_patterns();

-- 5. Enable RLS
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view fraud alerts
DROP POLICY IF EXISTS "Admins can view all fraud alerts" ON public.fraud_alerts;
CREATE POLICY "Admins can view all fraud alerts" ON public.fraud_alerts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_role = 'admin'
    )
);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access" ON public.fraud_alerts;
CREATE POLICY "Service role full access" ON public.fraud_alerts
FOR ALL USING (auth.role() = 'service_role');
