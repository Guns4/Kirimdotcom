-- 1. Ensure subscriptions table exists (from supabase-monetization-schema.sql)
-- Note: This table likely already exists in your database

-- 2. Add monthly_price column if it doesn't exist (for future use)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'monthly_price'
    ) THEN
        ALTER TABLE public.subscriptions ADD COLUMN monthly_price NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 3. View: Monthly Metrics (MRR calculated from TRANSACTIONS)
-- This approach uses actual payment data instead of subscription prices
CREATE OR REPLACE VIEW public.saas_monthly_metrics AS
WITH monthly_data AS (
    SELECT
        date_trunc('month', t.created_at) as month,
        -- Count active subscriptions
        COUNT(DISTINCT s.user_id) FILTER (WHERE s.status = 'active') as active_users,
        -- Count cancelled this month
        COUNT(DISTINCT s.user_id) FILTER (
            WHERE s.status = 'cancelled' 
            AND date_trunc('month', s.end_date) = date_trunc('month', t.created_at)
        ) as churned_users,
        -- Calculate MRR from successful transactions
        SUM(t.amount / 1000000.0) FILTER (WHERE t.status = 'success') as mrr
    FROM public.transactions t
    LEFT JOIN public.subscriptions s ON t.subscription_id = s.id
    WHERE t.created_at >= (now() - interval '12 months')
    GROUP BY 1
)
SELECT
    month,
    COALESCE(mrr, 0) as mrr,
    COALESCE(active_users, 0) as active_users,
    
    -- Calculate ARPU (Average Revenue Per User)
    CASE 
        WHEN active_users > 0 THEN ROUND(COALESCE(mrr, 0) / active_users, 0)
        ELSE 0 
    END as arpu,
    
    -- Calculate Churn Rate (%)
    CASE 
        WHEN (active_users + churned_users) > 0 THEN 
            ROUND((churned_users::numeric / NULLIF(active_users + churned_users, 0)) * 100, 2)
        ELSE 0 
    END as churn_rate
FROM monthly_data
ORDER BY month ASC;

-- Grant access to authenticated users
GRANT SELECT ON public.saas_monthly_metrics TO authenticated;
