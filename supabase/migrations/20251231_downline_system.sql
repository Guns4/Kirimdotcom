-- Downline System Schema
-- Phase 1761-1765

-- 1. User Relations Table (Who referred whom)
CREATE TABLE IF NOT EXISTS public.user_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    upline_id UUID NOT NULL REFERENCES auth.users(id),
    downline_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE, -- One downline can only have one upline
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup of downlines
CREATE INDEX IF NOT EXISTS idx_user_relations_upline ON public.user_relations(upline_id);
CREATE INDEX IF NOT EXISTS idx_user_relations_downline ON public.user_relations(downline_id);

-- 2. Referral Codes (Simple mapping, or could be in users table)
-- Assuming users table has a referral_code column, if not, we can create a mapping or use ID
-- Let's stick to using user ID or a separate code if needed. user_metadata usually holds this.

-- 3. RLS
ALTER TABLE public.user_relations ENABLE ROW LEVEL SECURITY;

-- Upline can view their downlines
CREATE POLICY "Upline can view downlines" 
ON public.user_relations FOR SELECT 
USING (auth.uid() = upline_id);

-- Downline can view their upline
CREATE POLICY "Downline can view upline" 
ON public.user_relations FOR SELECT 
USING (auth.uid() = downline_id);

-- Function to add commission (Safe RPC)
CREATE OR REPLACE FUNCTION add_commission(
    p_upline_id UUID,
    p_downline_id UUID,
    p_amount NUMERIC,
    p_description TEXT
) RETURNS VOID AS $$
BEGIN
    -- 1. Add balance to upline
    UPDATE public.users 
    SET balance = balance + p_amount 
    WHERE id = p_upline_id;

    -- 2. Record Transaction
    INSERT INTO public.wallet_transactions (
        user_id, 
        type, 
        amount, 
        description, 
        created_at
    ) VALUES (
        p_upline_id, 
        'COMMISSION_REWARD', 
        p_amount, 
        p_description, 
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
