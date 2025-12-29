-- 1. Create Refunds Audit Table
CREATE TABLE IF NOT EXISTS public.refunds (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id uuid REFERENCES public.transactions(id),
    user_id uuid REFERENCES auth.users(id),
    amount numeric NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Atomic Refund Function
CREATE OR REPLACE FUNCTION public.process_refund(p_transaction_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trx record;
    v_user_phone text;
    v_new_balance numeric;
BEGIN
    -- A. Lock & Get Transaction
    SELECT * INTO v_trx 
    FROM public.transactions 
    WHERE id = p_transaction_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Transaction not found"}'::jsonb;
    END IF;

    -- B. Validate Status (Prevent double refund)
    IF v_trx.status = 'REFUNDED' THEN
        RETURN '{"success": false, "error": "Already refunded"}'::jsonb;
    END IF;

    -- C. Get User Info (for notification)
    -- Tries 'contact_phone' from transaction first, then fallback to users table
    IF v_trx.contact_phone IS NOT NULL THEN
        v_user_phone := v_trx.contact_phone;
    ELSE
        BEGIN
            -- Attempt to get from public.users or profiles if exists
            -- Adjust table name 'public.users' as per your actual project schema (e.g., public.profiles)
            SELECT phone INTO v_user_phone FROM public.users WHERE id = v_trx.user_id; 
            EXCEPTION WHEN OTHERS THEN v_user_phone := NULL;
        END;
    END IF;

    -- D. Update Transaction Status
    UPDATE public.transactions 
    SET status = 'REFUNDED', updated_at = now()
    WHERE id = p_transaction_id;

    -- E. Credit Wallet (Assuming user_wallets table)
    UPDATE public.user_wallets
    SET balance = balance + v_trx.amount, updated_at = now()
    WHERE user_id = v_trx.user_id
    RETURNING balance INTO v_new_balance;

    -- F. Log Audit
    INSERT INTO public.refunds (transaction_id, user_id, amount, reason)
    VALUES (p_transaction_id, v_trx.user_id, v_trx.amount, p_reason);

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'user_id', v_trx.user_id,
        'user_phone', v_user_phone
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
