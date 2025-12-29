-- Ensure Withdrawal Requests Table Exists
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(19,4) NOT NULL,
    bank_code TEXT,
    account_number TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key-Value Store for System Settings (Flags)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Settings
INSERT INTO public.system_settings (key, value)
VALUES ('finance_maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Function: Check Velocity & Trigger Breaker
CREATE OR REPLACE FUNCTION check_financial_velocity() RETURNS TRIGGER AS $$
DECLARE
    v_total_outflow DECIMAL;
    v_limit DECIMAL := 10000000; -- Limit Rp 10 Juta / Jam
    v_maintenance BOOLEAN;
BEGIN
    -- 1. Check if already in Maintenance Mode
    SELECT (value)::boolean INTO v_maintenance 
    FROM public.system_settings 
    WHERE key = 'finance_maintenance_mode';
    
    IF v_maintenance IS TRUE THEN
        RAISE EXCEPTION 'SYSTEM_LOCKED: Financial Maintenance Mode is Active.';
    END IF;

    -- 2. Calculate Total Outflow (Withdrawals) in last 1 Hour
    -- Status should be 'COMPLETED' or 'PROCESSING' or 'REQUESTED' (if we count attempts)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_outflow
    FROM public.withdrawal_requests
    WHERE created_at > (NOW() - INTERVAL '1 hour');
    
    -- Add current request amount
    v_total_outflow := v_total_outflow + NEW.amount;

    -- 3. Check Threshold
    IF v_total_outflow > v_limit THEN
        -- !!! EMERGENCY STOP !!!
        
        -- A. Lock System
        UPDATE public.system_settings 
        SET value = 'true'::jsonb, updated_at = NOW()
        WHERE key = 'finance_maintenance_mode';
        
        -- B. Raise Error
        RAISE EXCEPTION 'EMERGENCY_STOP: Velocity Limit Exceeded (% > %). System Locked.', v_total_outflow, v_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind Trigger to Withdrawal Requests
DROP TRIGGER IF EXISTS tr_velocity_check ON public.withdrawal_requests;
CREATE TRIGGER tr_velocity_check
BEFORE INSERT ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION check_financial_velocity();
