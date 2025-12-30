-- Function to handle payments with automatic profit splitting
-- USAGE: Call this instead of a simple Debit.
CREATE OR REPLACE FUNCTION process_split_payment(
    p_user_id UUID,
    p_amount_total DECIMAL,   -- Total Price user pays (e.g. 10,500)
    p_amount_cost DECIMAL,    -- Base Cost (e.g. 10,000)
    p_description TEXT,
    p_ref_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_user_wallet_id UUID;
    v_operational_wallet_id UUID;
    v_revenue_wallet_id UUID;
    v_profit_amount DECIMAL;
    v_entry_id UUID;
BEGIN
    -- 1. Get Wallet IDs
    SELECT id INTO v_user_wallet_id FROM public.wallets WHERE user_id = p_user_id;
    SELECT id INTO v_operational_wallet_id FROM public.wallets WHERE slug = 'WALLET_OPERATIONAL';
    SELECT id INTO v_revenue_wallet_id FROM public.wallets WHERE slug = 'WALLET_SYSTEM_REVENUE';

    IF v_user_wallet_id IS NULL THEN
        RAISE EXCEPTION 'User wallet not found';
    END IF;

    -- 2. Validate Balance
    IF (SELECT balance FROM public.wallets WHERE id = v_user_wallet_id) < p_amount_total THEN
         RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- 3. Calculate Profit
    v_profit_amount := p_amount_total - p_amount_cost;
    IF v_profit_amount < 0 THEN
        RAISE EXCEPTION 'Negative profit detected. Aborting to prevent loss.';
    END IF;

    -- 4. ATOMIC LEDGER ENTRIES
    -- A. Debit User (pay full amount)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata)
    VALUES (v_user_wallet_id, 'DEBIT', p_amount_total, p_description, p_ref_id, '{"type": "purchase"}'::jsonb)
    RETURNING id INTO v_entry_id;

    -- B. Credit Operational (Capital Recovery)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata, destination_wallet_id)
    VALUES (v_operational_wallet_id, 'CREDIT', p_amount_cost, 'Capital Recovery: ' || p_description, p_ref_id, '{"source": "user_payment"}'::jsonb, v_user_wallet_id);

    -- C. Credit Revenue (Net Profit)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata, destination_wallet_id)
    VALUES (v_revenue_wallet_id, 'CREDIT', v_profit_amount, 'Profit: ' || p_description, p_ref_id, '{"source": "user_payment"}'::jsonb, v_user_wallet_id);

    RETURN jsonb_build_object('status', 'success', 'ledger_entry_id', v_entry_id, 'profit', v_profit_amount);
END;
$$ LANGUAGE plpgsql;

-- View for Revenue Reporting
CREATE OR REPLACE VIEW view_system_revenue AS
SELECT 
    le.created_at,
    le.amount as profit,
    le.description,
    le.reference_id
FROM public.ledger_entries le
JOIN public.wallets w ON le.wallet_id = w.id
WHERE w.slug = 'WALLET_SYSTEM_REVENUE'
ORDER BY le.created_at DESC;
