-- 1. Wallets Table (If you don't have one, this is a basic structure)
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance numeric DEFAULT 0,
    currency text DEFAULT 'IDR',
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. API Usage Logs
CREATE TABLE IF NOT EXISTS public.api_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    key_id uuid REFERENCES public.api_keys(id),
    endpoint text,
    status integer,
    cost numeric,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Atomic Charge Function
-- Validates Key Hash, Checks Balance, Deducts, Logs.
CREATE OR REPLACE FUNCTION public.charge_api_usage(
    p_key_hash text,
    p_cost numeric,
    p_endpoint text,
    p_ip_address text
)
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_key_id uuid;
    v_balance numeric;
    v_new_balance numeric;
BEGIN
    -- A. Validate API Key
    SELECT user_id, id INTO v_user_id, v_key_id
    FROM public.api_keys
    WHERE key_hash = p_key_hash
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid API Key', 'code', 401);
    END IF;

    -- B. Update Last Used
    UPDATE public.api_keys SET last_used_at = now() WHERE id = v_key_id;

    -- C. Check Balance (Lock row for update to prevent race conditions)
    SELECT balance INTO v_balance
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
         -- Attempt to create wallet if missing (Auto-provisioning logic optional)
         INSERT INTO public.wallets (user_id, balance) VALUES (v_user_id, 0) RETURNING balance INTO v_balance;
    END IF;

    IF v_balance < p_cost THEN
        -- Log attempt
        INSERT INTO public.api_logs (user_id, key_id, endpoint, status, cost, ip_address)
        VALUES (v_user_id, v_key_id, p_endpoint, 402, 0, p_ip_address);
        
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient Funds', 'code', 402);
    END IF;

    -- D. Process Charge
    v_new_balance := v_balance - p_cost;
    
    UPDATE public.wallets 
    SET balance = v_new_balance, updated_at = now() 
    WHERE user_id = v_user_id;

    -- E. Log Success
    INSERT INTO public.api_logs (user_id, key_id, endpoint, status, cost, ip_address)
    VALUES (v_user_id, v_key_id, p_endpoint, 200, p_cost, p_ip_address);

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'remaining_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
