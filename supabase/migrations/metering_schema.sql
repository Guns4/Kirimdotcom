-- Metering Schema
-- Tracks API usage and user billing plans

-- 1. Extend Users Table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS billing_plan TEXT DEFAULT 'FREE'; -- FREE, PRO, ENTERPRISE
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0; -- App Wallet Balance (IDR)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS free_quota_used INTEGER DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_quota_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Metering Logs (Audit Trail for Usage)
CREATE TABLE IF NOT EXISTS public.metering_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    endpoint TEXT NOT NULL, -- e.g. /api/integration/woocommerce/rates
    cost NUMERIC DEFAULT 0, -- Cost deducted
    status TEXT NOT NULL, -- success, failed, denied
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metering_user_date ON public.metering_logs(user_id, created_at);

-- 3. Wallet Transactions (Financial Record)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- DEPOSIT, WITHDRAWAL, API_USAGE, REFUND, BONUS
    amount NUMERIC NOT NULL,
    description TEXT,
    reference_id UUID, -- Link to metering_log id or payment gateway id
    balance_after NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.metering_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own logs" ON public.metering_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- System Function to Atomically Deduct Balance
-- Using PL/PGSQL to ensure concurrency safety
CREATE OR REPLACE FUNCTION deduct_balance(p_user_id UUID, p_amount NUMERIC, p_description TEXT, p_ref_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_bal NUMERIC;
BEGIN
    -- Lock row
    SELECT balance INTO current_bal FROM auth.users WHERE id = p_user_id FOR UPDATE;
    
    IF current_bal IS NULL OR current_bal < p_amount THEN
        RETURN FALSE;
    END IF;

    -- Update Balance
    UPDATE auth.users SET balance = balance - p_amount WHERE id = p_user_id;

    -- Insert Transaction Log
    INSERT INTO public.wallet_transactions (user_id, type, amount, description, reference_id, balance_after)
    VALUES (p_user_id, 'API_USAGE', -p_amount, p_description, p_ref_id, current_bal - p_amount);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
