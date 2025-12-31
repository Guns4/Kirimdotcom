-- PPOB Transaction Functions
-- Ensures atomic balance deduction and refunds

-- Deduct Balance Function
CREATE OR REPLACE FUNCTION deduct_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Lock the wallet row for update to prevent race conditions
    SELECT balance INTO v_current_balance
    FROM wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
    END IF;

    IF v_current_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE wallets
    SET balance = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql;

-- Refund Balance Function
CREATE OR REPLACE FUNCTION refund_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql;
