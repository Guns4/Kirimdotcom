-- ============================================
-- DATA CLEANUP & MAINTENANCE SCRIPTS
-- ============================================
-- Run in Supabase SQL Editor
-- ============================================
-- 1. CLEANUP FUNCTIONS
-- ============================================
-- Function to cleanup old search history (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_history(days_old INTEGER DEFAULT 30) RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN WITH deleted AS (
    DELETE FROM search_history
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    RETURNING 1
)
SELECT COUNT(*) INTO deleted_count
FROM deleted;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to cleanup expired cached resi
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN WITH deleted AS (
    DELETE FROM cached_resi
    WHERE expires_at < NOW()
    RETURNING 1
)
SELECT COUNT(*) INTO deleted_count
FROM deleted;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to cleanup old API request logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs(days_old INTEGER DEFAULT 90) RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN WITH deleted AS (
    DELETE FROM api_request_logs
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    RETURNING 1
)
SELECT COUNT(*) INTO deleted_count
FROM deleted;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to cleanup old tracking history for non-premium users (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_tracking_history(days_old INTEGER DEFAULT 7) RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN WITH deleted AS (
    DELETE FROM tracking_history th
    WHERE th.created_at < NOW() - (days_old || ' days')::INTERVAL
        AND th.user_id NOT IN (
            SELECT user_id
            FROM user_subscriptions
            WHERE status = 'active'
                AND expires_at > NOW()
        )
    RETURNING 1
)
SELECT COUNT(*) INTO deleted_count
FROM deleted;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- 2. MASTER CLEANUP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION run_all_cleanup_tasks() RETURNS TABLE(
        task_name TEXT,
        deleted_count INTEGER,
        executed_at TIMESTAMP
    ) AS $$
DECLARE search_deleted INTEGER := 0;
cache_deleted INTEGER := 0;
logs_deleted INTEGER := 0;
history_deleted INTEGER := 0;
BEGIN -- Run all cleanup tasks
SELECT cleanup_old_search_history(30) INTO search_deleted;
SELECT cleanup_expired_cache() INTO cache_deleted;
SELECT cleanup_old_api_logs(90) INTO logs_deleted;
-- Check if tracking_history table exists
IF EXISTS (
    SELECT
    FROM information_schema.tables
    WHERE table_name = 'tracking_history'
) THEN
SELECT cleanup_old_tracking_history(7) INTO history_deleted;
END IF;
-- Return results
RETURN QUERY
SELECT 'search_history'::TEXT,
    search_deleted,
    NOW()::TIMESTAMP
UNION ALL
SELECT 'cached_resi'::TEXT,
    cache_deleted,
    NOW()::TIMESTAMP
UNION ALL
SELECT 'api_request_logs'::TEXT,
    logs_deleted,
    NOW()::TIMESTAMP
UNION ALL
SELECT 'tracking_history'::TEXT,
    history_deleted,
    NOW()::TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- 3. STORAGE SIZE MONITORING
-- ============================================
CREATE OR REPLACE FUNCTION get_table_sizes() RETURNS TABLE(
        table_name TEXT,
        row_count BIGINT,
        size_bytes BIGINT,
        size_pretty TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT t.relname::TEXT,
    t.n_tup_ins - t.n_tup_del AS row_count,
    pg_total_relation_size(t.relid) AS size_bytes,
    pg_size_pretty(pg_total_relation_size(t.relid)) AS size_pretty
FROM pg_stat_user_tables t
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(t.relid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- 4. OPTIONAL: PG_CRON SETUP (if available)
-- ============================================
-- Enable pg_cron extension (requires Supabase Pro plan)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Schedule daily cleanup at 3:00 AM UTC
-- SELECT cron.schedule(
--   'daily-cleanup',
--   '0 3 * * *',
--   $$SELECT run_all_cleanup_tasks()$$
-- );
-- Schedule weekly cache cleanup on Sunday at 4:00 AM UTC
-- SELECT cron.schedule(
--   'weekly-cache-cleanup',
--   '0 4 * * 0',
--   $$SELECT cleanup_expired_cache()$$
-- );
-- View scheduled jobs
-- SELECT * FROM cron.job;
-- ============================================
-- 5. MANUAL CLEANUP (Run these when needed)
-- ============================================
-- Run all cleanup tasks manually:
-- SELECT * FROM run_all_cleanup_tasks();
-- Check table sizes:
-- SELECT * FROM get_table_sizes();
-- Cleanup specific table:
-- SELECT cleanup_old_search_history(30);
-- SELECT cleanup_expired_cache();
-- SELECT cleanup_old_api_logs(90);
-- ============================================
-- 6. VACUUM TABLES (Run periodically for performance)
-- ============================================
-- Note: Supabase auto-vacuums, but you can run manually if needed
-- VACUUM ANALYZE search_history;
-- VACUUM ANALYZE cached_resi;
-- VACUUM ANALYZE api_request_logs;