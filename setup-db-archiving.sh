#!/bin/bash

# =============================================================================
# Setup Database Archiving (Phase 126)
# Performance Optimization & Auto-Maintenance
# =============================================================================

echo "Setting up Database Archiving..."
echo "================================================="
echo ""

# 1. SQL Schema
echo "1. Generating SQL Schema..."
echo "   [!] Run this in Supabase SQL Editor:"

cat <<EOF > archiving_schema.sql
-- 1. Create Archive Table (Clone of structure)
-- We use 'w/o indexes' initially for faster inserts, but good to have user_id index for history lookups.
CREATE TABLE public.orders_archive (
    LIKE public.orders INCLUDING ALL
);

-- 2. Archiving Function
CREATE OR REPLACE FUNCTION public.archive_old_orders()
RETURNS integer
LANGUAGE plpgsql
AS \$\$
DECLARE
    moved_rows integer;
BEGIN
    -- Move data older than 6 months
    WITH moved AS (
        DELETE FROM public.orders
        WHERE created_at < NOW() - INTERVAL '6 months'
        RETURNING *
    )
    INSERT INTO public.orders_archive
    SELECT * FROM moved;
    
    GET DIAGNOSTICS moved_rows = ROW_COUNT;
    
    RETURN moved_rows;
END;
\$\$;

-- 3. Unified View (For History Page)
CREATE OR REPLACE VIEW public.all_orders_view AS
SELECT *, 'active' as storage_type FROM public.orders
UNION ALL
SELECT *, 'archive' as storage_type FROM public.orders_archive;

-- 4. Enable pg_cron (If available on your Supabase plan)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 5. Schedule Job (Monthly on the 1st at 3am)
-- SELECT cron.schedule('0 3 1 * *', 'SELECT archive_old_orders()');
EOF
echo "   [✓] archiving_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run the SQL in Supabase."
echo "2. If 'pg_cron' is not enabled/available, use a GitHub Action or Vercel Cron to call a Supabase RPC function monthly."
