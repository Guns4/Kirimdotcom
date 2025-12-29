#!/bin/bash

# =============================================================================
# Database Hygiene & Archiving Automation
# =============================================================================

echo "Initializing Database Archiving System..."
echo "================================================="

# 1. Database Schema & Logic
echo "1. Generating SQL Schema: archiving_schema.sql"
cat <<EOF > archiving_schema.sql
-- 1. Create Archive Table
-- We use 'LIKE' to copy the structure. We exclude indexes initially for faster inserts,
-- but typically you want at least the PK.
CREATE TABLE IF NOT EXISTS public.orders_archive (LIKE public.orders INCLUDING DEFAULTS);

-- Add a column to track when it was archived
ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone DEFAULT now();

-- 2. Archiving Function
-- Moves data older than 1 year in a single transaction
CREATE OR REPLACE FUNCTION public.archive_old_orders()
RETURNS void AS \$\$
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
\$\$ LANGUAGE plpgsql;

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
EOF
echo "   [?] Schema created."

echo ""
echo "================================================="
echo "Archiving Setup Complete!"
echo "1. Run 'archiving_schema.sql' in Supabase SQL Editor."
echo "2. NOTE: Ensure your Foreign Keys on 'orders' (e.g., from 'order_items') are handled."
echo "   - If they are ON DELETE RESTRICT (default), this function will fail."
echo "   - Recommend changing to ON DELETE CASCADE if you don't need to archive items,"
echo "   - OR extend the script to archive 'order_items' into 'order_items_archive' first."
