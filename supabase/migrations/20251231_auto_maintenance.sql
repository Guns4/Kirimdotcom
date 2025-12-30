-- Database Health Automation
-- Run this in Supabase SQL Editor

-- 1. Enable pg_cron (Required for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. View to monitor dead tuples (Health Check)
CREATE OR REPLACE VIEW monitor_dead_tuples AS
SELECT
    schemaname,
    relname AS table_name,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    ROUND((n_dead_tup::numeric / GREATEST(n_live_tup + n_dead_tup, 1)::numeric) * 100, 2) AS dead_ratio_percent,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- 3. Schedule Weekly Vacuum Analyze (Sunday at 04:00 AM)
-- Cleans up dead tuples and updates optimizer statistics
SELECT cron.schedule(
    'weekly-vacuum',
    '0 4 * * 0',
    $$VACUUM ANALYZE$$
);

-- 4. Schedule Monthly Reindex (1st of month at 03:00 AM)
-- Rebuilds indexes to reduce bloat and improve lookup speed
-- limiting to 'public' schema to be safe
SELECT cron.schedule(
    'monthly-reindex',
    '0 3 1 * *',
    $$REINDEX SCHEMA public$$
);

-- 5. Daily Cache Hit Ratio Check (Log only)
-- Runs daily at midnight to log cache hit ratio (for admin review in logs)
SELECT cron.schedule(
    'daily-health-log',
    '0 0 * * *',
    $$
    DO language plpgsql '
    DECLARE
        ratio numeric;
    BEGIN
        SELECT 
          sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))
        INTO ratio
        FROM pg_statio_user_tables;
        
        RAISE NOTICE ''Daily Cache Hit Ratio: %'', ratio;
    END
    '
    $$
);
