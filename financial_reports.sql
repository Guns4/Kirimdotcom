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
CREATE OR REPLACE VIEW view_monthly_pnl AS
SELECT
    TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM') AS month_str,
    
    -- Revenue (From System Revenue Wallet)
    COALESCE(SUM(CASE 
        WHEN w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT' THEN le.amount 
        ELSE 0 
    END), 0) AS total_revenue,
    
    -- Expenses (From operational_expenses table)
    COALESCE((
        SELECT SUM(amount) 
        FROM public.operational_expenses oe 
        WHERE TO_CHAR(DATE_TRUNC('month', oe.expense_date), 'YYYY-MM') = TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM')
    ), 0) AS total_expenses,
    
    -- Net Profit
    COALESCE(SUM(CASE 
        WHEN w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT' THEN le.amount 
        ELSE 0 
    END), 0) - 
    COALESCE((
        SELECT SUM(amount) 
        FROM public.operational_expenses oe 
        WHERE TO_CHAR(DATE_TRUNC('month', oe.expense_date), 'YYYY-MM') = TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM')
    ), 0) AS net_profit

FROM public.ledger_entries le
JOIN public.wallets w ON le.wallet_id = w.id
WHERE w.slug = 'WALLET_SYSTEM_REVENUE'
GROUP BY 1
ORDER BY 1 DESC;
