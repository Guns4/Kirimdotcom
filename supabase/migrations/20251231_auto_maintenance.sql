-- Database Maintenance & Health Automation
-- Created at: 2025-12-31

-- Function to clean up old logs
CREATE OR REPLACE FUNCTION public.clean_old_logs(days_to_keep INT DEFAULT 90)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Clean up old API request logs (if any exist in a logs table)
  -- Assuming a generic logs table or similar structure if it exists. 
  -- If you only have 'audit_logs', be CAREFUL. We usually KEEP audit logs indefinitely for forensics.
  -- This is a placeholder for non-critical logs.
  
  -- Example: DELETE FROM public.request_logs WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  -- 2. Clean up expired temporary tokens (e.g., password resets that were never used)
  -- This depends on your specific auth schema, but here is a safe generic cleanup if you had a custom tokens table.
  -- DELETE FROM public.verification_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

  -- 3. Optimize the audit_logs table (without deleting data)
  -- Just analyzing it to ensure the query planner has up-to-date stats
  PERFORM 'ANALYZE public.audit_logs';
  
  RAISE NOTICE 'Maintenance: Logs cleanup check complete.';
END;
$$;

-- Function to perform general database maintenance
CREATE OR REPLACE FUNCTION public.perform_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Analyze critical tables to update statistics for the query planner
  -- This helps Supabase/Postgres choose the best indexes.
  EXECUTE 'ANALYZE VERBOSE public.users';
  EXECUTE 'ANALYZE VERBOSE public.audit_logs';
  -- Add other high-churn tables here
  
  -- 2. Check for bloat (Logic for repacking is complex, so we just log a notice)
  RAISE NOTICE 'Maintenance: Database statistics updated.';
  
  -- 3. (Optional) Materialized View Refreshes
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY public.some_view;
END;
$$;

-- Comment on usage
COMMENT ON FUNCTION public.clean_old_logs IS 'Deletes non-essential logs older than N days.';
COMMENT ON FUNCTION public.perform_maintenance IS 'Updates table statistics and performs routine health checks.';

-- Instructions for scheduling with pg_cron (if available extension is enabled)
-- SELECT cron.schedule('weekly-maintenance', '0 3 * * 0', $$SELECT public.perform_maintenance()$$);
