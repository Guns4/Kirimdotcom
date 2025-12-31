# Database Maintenance & Health Automation

This module provides SQL functions and strategies to keep your Supabase database healthy, performant, and clutter-free.

## included Files

- `supabase/migrations/20251231_auto_maintenance.sql`: Contains the SQL functions for maintenance.

## Functions

### 1. `perform_maintenance()`

**Purpose**: Updates database statistics (`ANALYZE`) for critical tables to ensure the query planner makes efficient decisions.
**Usage**: Run this manually or schedule it.

```sql
SELECT public.perform_maintenance();
```

### 2. `clean_old_logs(days_to_keep INT)`

**Purpose**: Cleans up expired or old data that is no longer needed (e.g., temporary tokens, non-forensic logs).
**Default**: Keeps 90 days of data.
**Usage**:

```sql
SELECT public.clean_old_logs(30); -- Keep only 30 days
```

> **Note**: This function is designed to be safe and does NOT delete from the immutable `audit_logs` table by default.

## Scheduling Automation

You have two main options to automate this:

### Option A: Using `pg_cron` (Recommended)

If your Supabase project has the `pg_cron` extension enabled:

1. Enable the extension in the dashboard.
2. Run the following SQL:

```sql
-- Schedule maintenance every Sunday at 3 AM
SELECT cron.schedule('weekly-maintenance', '0 3 * * 0', $$SELECT public.perform_maintenance()$$);

-- Schedule log cleanup every day at 4 AM
SELECT cron.schedule('daily-cleanup', '0 4 * * *', $$SELECT public.clean_old_logs(60)$$);
```

### Option B: GitHub Actions / Cron Job

You can call these functions via the Supabase client or REST API from a scheduled script (e.g., a GitHub Action).

## Monitoring

Check the Postgres logs in your Supabase Dashboard to see the output of `RAISE NOTICE` from these functions.
