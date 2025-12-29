-- ============================================================================
-- Database Archiving Schema (Phase 126)
-- Performance Optimization & Auto-Maintenance
-- ============================================================================

-- 1. Create Archive Table
-- Clone structure from orders table
CREATE TABLE IF NOT EXISTS public.orders_archive (
    LIKE public.orders INCLUDING ALL
);

-- Add index for fast user lookups in archive
CREATE INDEX IF NOT EXISTS idx_orders_archive_user_id 
ON public.orders_archive(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_archive_created 
ON public.orders_archive(created_at DESC);

-- 2. Archiving Function
CREATE OR REPLACE FUNCTION public.archive_old_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    moved_rows integer;
BEGIN
    -- Move data older than 6 months to archive
    WITH moved AS (
        DELETE FROM public.orders
        WHERE created_at < NOW() - INTERVAL '6 months'
        AND status IN ('COMPLETED', 'CANCELLED', 'DELIVERED')
        RETURNING *
    )
    INSERT INTO public.orders_archive
    SELECT * FROM moved;
    
    GET DIAGNOSTICS moved_rows = ROW_COUNT;
    
    -- Log archiving activity
    RAISE NOTICE 'Archived % orders older than 6 months', moved_rows;
    
    RETURN moved_rows;
END;
$$;

-- 3. Unified View for All Orders (Active + Archive)
CREATE OR REPLACE VIEW public.view_all_orders AS
SELECT 
    *,
    'active' as storage_type,
    false as is_archived
FROM public.orders
UNION ALL
SELECT 
    *,
    'archive' as storage_type,
    true as is_archived
FROM public.orders_archive;

-- 4. Function to retrieve user order history (including archive)
CREATE OR REPLACE FUNCTION public.get_user_order_history(
    p_user_id UUID,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    order_number TEXT,
    total_amount NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ,
    is_archived BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.order_number,
        v.total_amount,
        v.status,
        v.created_at,
        v.is_archived
    FROM public.view_all_orders v
    WHERE v.user_id = p_user_id
    ORDER BY v.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 5. RLS Policies for Archive
ALTER TABLE public.orders_archive ENABLE ROW LEVEL SECURITY;

-- Users can view their own archived orders
CREATE POLICY "Users can view own archived orders"
ON public.orders_archive
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert/delete archive
CREATE POLICY "Service role full access to archive"
ON public.orders_archive
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Stats View for Admin
CREATE OR REPLACE VIEW public.view_archiving_stats AS
SELECT 
    'active' as storage,
    COUNT(*) as order_count,
    SUM(total_amount) as total_value,
    MIN(created_at) as oldest_order,
    MAX(created_at) as newest_order
FROM public.orders
UNION ALL
SELECT 
    'archive' as storage,
    COUNT(*) as order_count,
    SUM(total_amount) as total_value,
    MIN(created_at) as oldest_order,
    MAX(created_at) as newest_order
FROM public.orders_archive;

-- 7. Optional: pg_cron scheduling (if available)
-- Uncomment if pg_cron extension is enabled:
-- 
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule(
--     'monthly-archiving',
--     '0 3 1 * *',  -- 3 AM on 1st of every month
--     'SELECT public.archive_old_orders()'
-- );

-- Comments
COMMENT ON TABLE public.orders_archive IS 'Archive storage for orders older than 6 months';
COMMENT ON FUNCTION public.archive_old_orders() IS 'Moves completed/cancelled orders older than 6 months to archive';
COMMENT ON VIEW public.view_all_orders IS 'Unified view of active and archived orders';
COMMENT ON FUNCTION public.get_user_order_history(UUID, INT, INT) IS 'Retrieves complete order history including archived orders';
