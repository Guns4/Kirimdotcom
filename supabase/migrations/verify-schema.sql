-- ==========================================
-- Database Schema Verification Script
-- Run this AFTER applying the main migration
-- ==========================================
-- 1. List all created tables
SELECT tablename as table_name,
    schemaname as schema
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'shipping_cache',
        'tracking_history',
        'ppob_transactions',
        'ppob_products'
    )
ORDER BY tablename;
-- 2. Check indexes
SELECT tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'shipping_cache',
        'tracking_history',
        'ppob_transactions',
        'ppob_products'
    )
ORDER BY tablename,
    indexname;
-- 3. Verify RLS policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename,
    policyname;
-- 4. Check triggers
SELECT trigger_name,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table,
    trigger_name;
-- 5. Test utility functions
SELECT cleanup_expired_shipping_cache();
SELECT *
FROM get_cache_statistics();
-- 6. Sample data test (Optional)
-- Insert test cache entry
INSERT INTO public.shipping_cache (
        origin,
        destination,
        weight,
        courier,
        service,
        price,
        price_data
    )
VALUES (
        'Jakarta',
        'Surabaya',
        1000,
        'jne',
        'REG',
        15000,
        '{"test": true}'::jsonb
    );
-- Verify insert
SELECT *
FROM public.shipping_cache
LIMIT 1;
-- Cleanup test data
DELETE FROM public.shipping_cache
WHERE price_data->>'test' = 'true';
-- 7. Final health check
SELECT 'shipping_cache' as table_name,
    COUNT(*) as row_count,
    pg_size_pretty(pg_total_relation_size('public.shipping_cache')) as table_size
FROM public.shipping_cache
UNION ALL
SELECT 'tracking_history',
    COUNT(*),
    pg_size_pretty(
        pg_total_relation_size('public.tracking_history')
    )
FROM public.tracking_history
UNION ALL
SELECT 'ppob_transactions',
    COUNT(*),
    pg_size_pretty(
        pg_total_relation_size('public.ppob_transactions')
    )
FROM public.ppob_transactions
UNION ALL
SELECT 'ppob_products',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('public.ppob_products'))
FROM public.ppob_products;
-- ==========================================
-- Expected Results:
-- - 4 tables created
-- - 10+ indexes created
-- - 8+ RLS policies active
-- - 3 triggers active
-- - Functions working
-- ==========================================