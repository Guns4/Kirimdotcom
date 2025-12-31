-- Add metering columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS api_usage_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_plan TEXT DEFAULT 'STARTER'; -- STARTER, PRO, ENTERPRISE

-- Optional: Reset usage daily (Requires pg_cron or external cron)
-- SELECT cron.schedule('0 0 * * *', $$UPDATE public.users SET api_usage_today = 0$$);
