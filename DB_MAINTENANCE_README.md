# Database Maintenance Guide

To finalize the automation, follow these steps:

1.  **Go to Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  **Open SQL Editor**.
3.  **Run the Migration**:
    Copy the contents of `supabase/migrations/20251231_auto_maintenance.sql` and run it.

## What this does:
-   **Enables `pg_cron`**: Allows scheduling jobs inside the database.
-   **Weekly Vacuum**: Runs every Sunday at 4 AM to clean up deleted data and keep size down.
-   **Monthly Reindex**: Runs on the 1st of every month to optimize search indexes.
-   **Health Monitor**: Creates a view `monitor_dead_tuples` for you to inspect table health.

## How to check health manually:
Run this query in SQL Editor:
```sql
SELECT * FROM monitor_dead_tuples;
```
If `dead_ratio_percent` is > 10% for large tables, consider running a manual VACUUM.
