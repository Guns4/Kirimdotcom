-- ==========================================
-- Wallet Balance Management Functions
-- For PPOB Transactions with Atomic Operations
-- ==========================================
-- 1. Create wallets table if not exists
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets (user_id);
-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "Users can view own wallet" ON public.wallets FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR
UPDATE USING (auth.uid() = user_id);
-- ==========================================
-- RPC Function: Deduct Balance (Atomic)
-- ==========================================
CREATE OR REPLACE FUNCTION deduct_balance(p_user_id UUID, p_amount NUMERIC) RETURNS TABLE (
        success BOOLEAN,
        message TEXT,
        new_balance NUMERIC
    ) AS $$
DECLARE current_balance NUMERIC;
v_new_balance NUMERIC;
BEGIN -- Lock row for update (prevent race conditions)
SELECT balance INTO current_balance
FROM public.wallets
WHERE user_id = p_user_id FOR
UPDATE;
-- Check if wallet exists
IF current_balance IS NULL THEN RETURN QUERY
SELECT false,
    'Wallet not found'::TEXT,
    0::NUMERIC;
RETURN;
END IF;
-- Check sufficient balance
IF current_balance < p_amount THEN RETURN QUERY
SELECT false,
    'Insufficient balance'::TEXT,
    current_balance;
RETURN;
END IF;
-- Deduct balance
UPDATE public.wallets
SET balance = balance - p_amount,
    updated_at = NOW()
WHERE user_id = p_user_id
RETURNING balance INTO v_new_balance;
-- Return success
RETURN QUERY
SELECT true,
    'Balance deducted successfully'::TEXT,
    v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- RPC Function: Add Balance (Refund/Top-up)
-- ==========================================
CREATE OR REPLACE FUNCTION add_balance(p_user_id UUID, p_amount NUMERIC) RETURNS TABLE (
        success BOOLEAN,
        message TEXT,
        new_balance NUMERIC
    ) AS $$
DECLARE v_new_balance NUMERIC;
BEGIN -- Check if wallet exists, create if not
INSERT INTO public.wallets (user_id, balance)
VALUES (p_user_id, 0) ON CONFLICT (user_id) DO NOTHING;
-- Add balance
UPDATE public.wallets
SET balance = balance + p_amount,
    updated_at = NOW()
WHERE user_id = p_user_id
RETURNING balance INTO v_new_balance;
-- Return success
RETURN QUERY
SELECT true,
    'Balance added successfully'::TEXT,
    v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- RPC Function: Get Balance
-- ==========================================
CREATE OR REPLACE FUNCTION get_balance(p_user_id UUID) RETURNS NUMERIC AS $$
DECLARE v_balance NUMERIC;
BEGIN
SELECT balance INTO v_balance
FROM public.wallets
WHERE user_id = p_user_id;
RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- Auto-update timestamp trigger
-- ==========================================
CREATE TRIGGER update_wallets_timestamp BEFORE
UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==========================================
-- Comments
-- ==========================================
COMMENT ON TABLE public.wallets IS 'User wallet balances for PPOB transactions';
COMMENT ON FUNCTION deduct_balance IS 'Atomically deduct balance with validation';
COMMENT ON FUNCTION add_balance IS 'Add balance for top-up or refund';
COMMENT ON FUNCTION get_balance IS 'Get user current balance';
-- ==========================================
-- Test Data (Optional - for development)
-- ==========================================
-- Uncomment to create test wallet
-- INSERT INTO public.wallets (user_id, balance) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 100000)
-- ON CONFLICT (user_id) DO NOTHING;