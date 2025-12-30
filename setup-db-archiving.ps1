# Database Hygiene & Archiving Automation (PowerShell)

Write-Host "Initializing Database Archiving System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Database Schema & Logic
Write-Host "1. Generating SQL Schema: archiving_schema.sql" -ForegroundColor Yellow

$sqlContent = @'
-- 1. Create Archive Table
-- We use 'LIKE' to copy the structure. We exclude indexes initially for faster inserts,
-- but typically you want at least the PK.
CREATE TABLE IF NOT EXISTS public.orders_archive (LIKE public.orders INCLUDING DEFAULTS);

-- Add a column to track when it was archived
ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone DEFAULT now();

-- 2. Archiving Function
-- Moves data older than 1 year in a single transaction
CREATE OR REPLACE FUNCTION public.archive_old_orders()
RETURNS void AS $$
DECLARE
    row_count int;
BEGIN
    -- Optional: If you have dependent tables (like order_items), you must handle them first
    -- or ensure your Foreign Keys are set to ON DELETE CASCADE.
    -- If CASCADE is set, deleting the order deletes the items (which effectively deletes them, NOT archive them).
    -- To archive items properly, you would need a similar logic for 'order_items' -> 'order_items_archive'.
    -- For this script, we focus on the 'orders' table as requested.

    WITH moved_rows AS (
        DELETE FROM public.orders
        WHERE created_at < (now() - INTERVAL '1 year')
        RETURNING *
    )
    INSERT INTO public.orders_archive 
    SELECT *, now() FROM moved_rows;

    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Archived % orders.', row_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Scheduling (Requires pg_cron extension)
-- Enable the extension if not already enabled (Supabase supports this)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule to run at 00:00 on the 1st of every month
-- Syntax: cron.schedule(job_name, schedule, command)
SELECT cron.schedule(
    'archive_monthly', 
    '0 0 1 * *', 
    'SELECT public.archive_old_orders()'
);

-- Check Scheduled Jobs
-- SELECT * FROM cron.job;
'@

$sqlContent | Set-Content -Path "archiving_schema.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Archiving Setup Complete!" -ForegroundColor Green
Write-Host "1. Run 'archiving_schema.sql' in Supabase SQL Editor." -ForegroundColor White
Write-Host "2. NOTE: Ensure your Foreign Keys on 'orders' (e.g., from 'order_items') are handled." -ForegroundColor White
Write-Host "   - If they are ON DELETE RESTRICT (default), this function will fail." -ForegroundColor White
Write-Host "   - Recommend changing to ON DELETE CASCADE if you don't need to archive items," -ForegroundColor White
Write-Host "   - OR extend the script to archive 'order_items' into 'order_items_archive' first." -ForegroundColor White
