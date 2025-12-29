-- Table to track operational expenses (Servers, APIs, Salaries)
CREATE TABLE IF NOT EXISTS public.operational_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    amount DECIMAL(19,4) NOT NULL,
    category TEXT NOT NULL, -- 'HOSTING', 'API_COST', 'MARKETING'
    description TEXT,
    
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIew: Monthly P&L (Profit & Loss)
-- Aggregates Revenue from System Wallet vs Expenses
-- REWRITTEN using CTEs to avoid Grouping Errors
CREATE OR REPLACE VIEW view_monthly_pnl AS
WITH revenue_data AS (
    SELECT
        TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM') AS month_str,
        COALESCE(SUM(le.amount), 0) as total_revenue
    FROM public.ledger_entries le
    JOIN public.wallets w ON le.wallet_id = w.id
    WHERE w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT'
    GROUP BY 1
),
expense_data AS (
    SELECT
         TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS month_str,
         COALESCE(SUM(amount), 0) as total_expenses
    FROM public.operational_expenses
    GROUP BY 1
)
SELECT
    COALESCE(r.month_str, e.month_str) as month_str,
    COALESCE(r.total_revenue, 0) as total_revenue,
    COALESCE(e.total_expenses, 0) as total_expenses,
    (COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0)) as net_profit
FROM revenue_data r
FULL OUTER JOIN expense_data e ON r.month_str = e.month_str
ORDER BY 1 DESC;
