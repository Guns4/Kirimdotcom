-- Tier Pricing Schema
-- Phase 1751-1755

-- 1. Add 'tier' column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'BASIC'; -- BASIC, RESELLER, VIP

-- 2. Create Tier Definitions (Optional, for dynamic config, but requirements are hardcoded)
-- We'll use a simple table to store costs for auditing
CREATE TABLE IF NOT EXISTS public.tier_upgrades_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    from_tier TEXT,
    to_tier TEXT,
    cost NUMERIC,
    status TEXT DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Function to handle Upgrade (Atomic Transaction)
CREATE OR REPLACE FUNCTION upgrade_user_tier(
    p_user_id UUID,
    p_target_tier TEXT,
    p_cost NUMERIC
) RETURNS JSONB AS $$
DECLARE
    v_balance NUMERIC;
    v_current_tier TEXT;
BEGIN
    -- Get current balance and tier
    SELECT balance, tier INTO v_balance, v_current_tier FROM public.users WHERE id = p_user_id;

    -- Checks
    IF v_balance < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    IF v_current_tier = p_target_tier THEN
         RETURN jsonb_build_object('success', false, 'message', 'Already on this tier');
    END IF;

    -- Deduct Balance
    UPDATE public.users 
    SET balance = balance - p_cost,
        tier = p_target_tier
    WHERE id = p_user_id;

    -- Log Transaction (Wallet)
    INSERT INTO public.wallet_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'TIER_UPGRADE', p_cost, 'Upgrade to ' || p_target_tier);

    -- Log Audit
    INSERT INTO public.tier_upgrades_log (user_id, from_tier, to_tier, cost)
    VALUES (p_user_id, v_current_tier, p_target_tier, p_cost);

    RETURN jsonb_build_object('success', true, 'message', 'Upgrade successful');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
