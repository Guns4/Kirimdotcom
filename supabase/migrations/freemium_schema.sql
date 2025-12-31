-- Add freemium quota tracking to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS free_quota_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month');

-- Function to reset quota monthly (can be called by cron)
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET free_quota_used = 0,
        quota_reset_at = (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
    WHERE quota_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule with pg_cron (if available)
-- SELECT cron.schedule('0 0 1 * *', $$SELECT reset_monthly_quota()$$);
