-- Table to track operational expenses (Servers, APIs, Salaries)
CREATE TABLE IF NOT EXISTS public.operational_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    amount DECIMAL(19,4) NOT NULL,
    category TEXT NOT NULL, -- 'HOSTING', 'API_COST', 'MARKETING'
    description TEXT,
    
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View: Monthly P&L (Profit & Loss)
-- Aggregates Revenue from System Wallet vs Expenses
CREATE OR REPLACE VIEW view_monthly_pnl AS
WITH monthly_revenue AS (
    SELECT
        TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM') AS month_str,
        COALESCE(SUM(le.amount), 0) AS total_revenue
    FROM public.ledger_entries le
    JOIN public.wallets w ON le.wallet_id = w.id
    WHERE w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT'
    GROUP BY 1
),
monthly_expenses AS (
    SELECT
        TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS month_str,
        COALESCE(SUM(amount), 0) AS total_expenses
    FROM public.operational_expenses
    GROUP BY 1
)
SELECT
    COALESCE(r.month_str, e.month_str) AS month_str,
    COALESCE(r.total_revenue, 0) AS total_revenue,
    COALESCE(e.total_expenses, 0) AS total_expenses,
    COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0) AS net_profit
FROM monthly_revenue r
FULL OUTER JOIN monthly_expenses e ON r.month_str = e.month_str
ORDER BY 1 DESC;
