# Financial Compliance: Tax Automator (PowerShell)

Write-Host "Initializing Tax Automator..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Logic
Write-Host "1. Generating SQL: tax_logic.sql" -ForegroundColor Yellow
$sqlContent = @'
-- Function to handle payments with automatic profit splitting AND TAX
CREATE OR REPLACE FUNCTION process_split_payment_with_tax(
    p_user_id UUID,
    p_amount_total DECIMAL,   -- Total Price user pays (e.g. 10,500)
    p_amount_cost DECIMAL,    -- Base Cost (e.g. 10,000)
    p_description TEXT,
    p_ref_id TEXT,
    p_tax_rate DECIMAL DEFAULT 0.01 -- 1% Flat Tax for UMKM (Adjust as needed)
) RETURNS JSONB AS $$
DECLARE
    v_user_wallet_id UUID;
    v_operational_wallet_id UUID;
    v_revenue_wallet_id UUID;
    v_tax_wallet_id UUID;
    
    v_profit_gross DECIMAL;
    v_tax_amount DECIMAL;
    v_profit_net DECIMAL;
    
    v_entry_id UUID;
BEGIN
    -- 1. Get Wallet IDs
    SELECT id INTO v_user_wallet_id FROM public.wallets WHERE user_id = p_user_id;
    SELECT id INTO v_operational_wallet_id FROM public.wallets WHERE slug = 'WALLET_OPERATIONAL';
    SELECT id INTO v_revenue_wallet_id FROM public.wallets WHERE slug = 'WALLET_SYSTEM_REVENUE';
    SELECT id INTO v_tax_wallet_id FROM public.wallets WHERE slug = 'WALLET_TAX_RESERVE';

    IF v_user_wallet_id IS NULL THEN
        RAISE EXCEPTION 'User wallet not found';
    END IF;

    -- 2. Validate Balance
    IF (SELECT balance FROM public.wallets WHERE id = v_user_wallet_id) < p_amount_total THEN
         RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- 3. Calculate Accounting
    v_profit_gross := p_amount_total - p_amount_cost;
    IF v_profit_gross < 0 THEN
        RAISE EXCEPTION 'Negative profit detected. Aborting to prevent loss.';
    END IF;
    
    -- Tax Logic
    v_tax_amount := v_profit_gross * p_tax_rate;
    v_profit_net := v_profit_gross - v_tax_amount;

    -- 4. ATOMIC LEDGER ENTRIES
    -- A. Debit User (pay full amount)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata)
    VALUES (v_user_wallet_id, 'DEBIT', p_amount_total, p_description, p_ref_id, '{"type": "purchase"}'::jsonb)
    RETURNING id INTO v_entry_id;

    -- B. Credit Operational (Capital Recovery)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata, destination_wallet_id)
    VALUES (v_operational_wallet_id, 'CREDIT', p_amount_cost, 'Capital Recovery: ' || p_description, p_ref_id, '{"source": "user_payment"}'::jsonb, v_user_wallet_id);
    
    -- C. Credit TAX Reserve
    IF v_tax_amount > 0 THEN
        INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata, destination_wallet_id)
        VALUES (v_tax_wallet_id, 'CREDIT', v_tax_amount, 'Tax Reserve: ' || p_description, p_ref_id, '{"source": "user_payment_tax"}'::jsonb, v_user_wallet_id);
    END IF;

    -- D. Credit Revenue (Net Profit after Tax)
    INSERT INTO public.ledger_entries (wallet_id, entry_type, amount, description, reference_id, metadata, destination_wallet_id)
    VALUES (v_revenue_wallet_id, 'CREDIT', v_profit_net, 'Profit (Net): ' || p_description, p_ref_id, '{"source": "user_payment"}'::jsonb, v_user_wallet_id);

    RETURN jsonb_build_object(
        'status', 'success', 
        'profit_gross', v_profit_gross,
        'tax_reserved', v_tax_amount,
        'profit_net', v_profit_net
    );
END;
$$ LANGUAGE plpgsql;

-- View: Estimated Tax Liability (Monthly)
CREATE OR REPLACE VIEW view_tax_liability AS
SELECT
    TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM') AS month_str,
    SUM(le.amount) as estimated_tax_due
FROM public.ledger_entries le
JOIN public.wallets w ON le.wallet_id = w.id
WHERE w.slug = 'WALLET_TAX_RESERVE' AND le.entry_type = 'CREDIT'
GROUP BY 1
ORDER BY 1 DESC;
'@
$sqlContent | Set-Content -Path "tax_logic.sql" -Encoding UTF8
Write-Host "   [?] SQL logic generated." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Tax Automator Ready!" -ForegroundColor Green
Write-Host "1. Run 'tax_logic.sql' to upgrade the payment function." -ForegroundColor White
Write-Host "2. Check 'view_tax_liability' for monthly tax reports." -ForegroundColor White
