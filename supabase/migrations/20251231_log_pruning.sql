-- Data Hygiene Schema
-- Log Pruning & Storage Optimization

-- 1. Create Pruning Function
CREATE OR REPLACE FUNCTION prune_old_logs()
RETURNS void AS $$
BEGIN
    -- Prune API Logs
    -- Using loose availability check to prevent errors if tables don't exist yet
    BEGIN
        DELETE FROM api_logs WHERE created_at < NOW() - INTERVAL '30 days';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table api_logs does not exist, skipping.';
    END;

    -- Prune Webhook Logs
    BEGIN
        DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '30 days';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table webhook_logs does not exist, skipping.';
    END;

    -- Prune Notification History
    BEGIN
        DELETE FROM notification_history WHERE created_at < NOW() - INTERVAL '30 days';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table notification_history does not exist, skipping.';
    END;
    
    -- Prune H2H Request Logs (Bonus from Phase 1756)
    BEGIN
        DELETE FROM h2h_request_logs WHERE created_at < NOW() - INTERVAL '30 days';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Table h2h_request_logs does not exist, skipping.';
    END;

    -- Prune Financial Incidents (Usually keep longer, maybe 90 days? But per requirement 30 days default)
    -- We'll skip financial incidents for now as they are critical audit trails
END;
$$ LANGUAGE plpgsql;

-- 2. Schedule with pg_cron
-- Note: pg_cron must be enabled in Supabase extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule: Every Sunday at 00:00 (Midnight)
SELECT cron.schedule(
    'prune-weekly-logs', -- job name
    '0 0 * * 0',         -- cron schedule (Sunday Midnight)
    'SELECT prune_old_logs()'
);

-- Manual Execution Helper
-- SELECT prune_old_logs();
