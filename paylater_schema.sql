-- Debt Ledger (Tracks PayLater usage)
-- We use the main ledger_entries but with specific types, 
-- but we also need a materialized view or summary for easier eligibility checks.

-- Function to check eligibility:
-- 1. Account Age > 3 Months
-- 2. Total Lifetime Transaction > 1,000,000
CREATE OR REPLACE FUNCTION check_paylater_eligibility(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    account_age_days INT;
    total_spend DECIMAL;
BEGIN
    -- Check Age
    SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO account_age_days
    FROM auth.users
    WHERE id = check_user_id;

    -- Check Spend (Sum of DEBIT/SPEND transactions)
    -- Assuming ledger_entries has amount < 0 for spend
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO total_spend
    FROM ledger_entries
    WHERE user_id = check_user_id AND amount < 0;

    -- Conditions: Age > 90 days AND Spend > 1,000,000
    IF account_age_days > 90 AND total_spend > 1000000 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Auto-Repayment on Topup
-- When a user receives money (amount > 0), check if they have debt.
-- If debt > 0, deduct automatically.
-- (This is complex to do purely in SQL without circular triggers, 
--  so we will implement the logic in the Application Layer / API for safety).
