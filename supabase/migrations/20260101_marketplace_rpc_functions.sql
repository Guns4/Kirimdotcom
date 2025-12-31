-- ==========================================
-- Additional Marketplace RPC Functions
-- Safe stock management & helper functions
-- ==========================================
-- ==========================================
-- Function: decrement_stock (Simple Version)
-- ==========================================
-- Safely decrement stock for physical products
-- Simplified version that only updates stock without validation
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_qty INT) RETURNS VOID AS $$ BEGIN
UPDATE public.marketplace_products
SET stock = stock - p_qty,
    updated_at = NOW()
WHERE id = p_product_id
    AND type = 'PHYSICAL'
    AND stock >= p_qty;
-- Only update if sufficient stock
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION decrement_stock IS 'Simple stock decrement for physical products - does not validate';
-- ==========================================
-- Function: increment_stock
-- ==========================================
-- Restore stock (for refunds or restocking)
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_qty INT) RETURNS VOID AS $$ BEGIN
UPDATE public.marketplace_products
SET stock = stock + p_qty,
    updated_at = NOW()
WHERE id = p_product_id
    AND type = 'PHYSICAL';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION increment_stock IS 'Restore stock for refunds or restocking';
-- ==========================================
-- Function: get_product_stock
-- ==========================================
-- Check current stock level
CREATE OR REPLACE FUNCTION get_product_stock(p_product_id UUID) RETURNS TABLE (
        sku VARCHAR,
        name VARCHAR,
        stock INT,
        is_available BOOLEAN
    ) AS $$ BEGIN RETURN QUERY
SELECT p.sku,
    p.name,
    p.stock,
    CASE
        WHEN p.type LIKE 'DIGITAL%' THEN true
        WHEN p.stock > 0 THEN true
        ELSE false
    END as is_available
FROM public.marketplace_products p
WHERE p.id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION get_product_stock IS 'Get product stock information';
-- ==========================================
-- Function: check_stock_availability
-- ==========================================
-- Check if products are available for checkout
CREATE OR REPLACE FUNCTION check_stock_availability(
        p_product_ids UUID [],
        p_quantities INT []
    ) RETURNS TABLE (
        product_id UUID,
        product_name VARCHAR,
        required_qty INT,
        available_stock INT,
        is_sufficient BOOLEAN
    ) AS $$ BEGIN RETURN QUERY
SELECT p.id as product_id,
    p.name as product_name,
    qty.qty as required_qty,
    p.stock as available_stock,
    CASE
        WHEN p.type LIKE 'DIGITAL%' THEN true
        WHEN p.stock >= qty.qty THEN true
        ELSE false
    END as is_sufficient
FROM public.marketplace_products p
    JOIN LATERAL (
        SELECT unnest(p_product_ids) as id,
            unnest(p_quantities) as qty
    ) qty ON qty.id = p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION check_stock_availability IS 'Batch check stock availability for multiple products';
-- ==========================================
-- Function: get_low_stock_products
-- ==========================================
-- Get products with low stock (for alerts)
CREATE OR REPLACE FUNCTION get_low_stock_products(p_threshold INT DEFAULT 10) RETURNS TABLE (
        id UUID,
        sku VARCHAR,
        name VARCHAR,
        stock INT,
        price_sell NUMERIC
    ) AS $$ BEGIN RETURN QUERY
SELECT p.id,
    p.sku,
    p.name,
    p.stock,
    p.price_sell
FROM public.marketplace_products p
WHERE p.type = 'PHYSICAL'
    AND p.is_active = true
    AND p.stock <= p_threshold
    AND p.stock > 0
ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION get_low_stock_products IS 'Get products with stock below threshold';
-- ==========================================
-- Function: get_order_summary
-- ==========================================
-- Get summary statistics for orders
CREATE OR REPLACE FUNCTION get_order_summary(
        p_user_id UUID DEFAULT NULL,
        p_days INT DEFAULT 30
    ) RETURNS TABLE (
        total_orders BIGINT,
        total_revenue NUMERIC,
        paid_orders BIGINT,
        paid_revenue NUMERIC,
        pending_orders BIGINT,
        completed_orders BIGINT
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(*)::BIGINT as total_orders,
    SUM(total_amount)::NUMERIC as total_revenue,
    COUNT(*) FILTER (
        WHERE payment_status = 'PAID'
    )::BIGINT as paid_orders,
    SUM(total_amount) FILTER (
        WHERE payment_status = 'PAID'
    )::NUMERIC as paid_revenue,
    COUNT(*) FILTER (
        WHERE order_status = 'PENDING'
    )::BIGINT as pending_orders,
    COUNT(*) FILTER (
        WHERE order_status = 'COMPLETED'
    )::BIGINT as completed_orders
FROM public.marketplace_orders
WHERE (
        p_user_id IS NULL
        OR user_id = p_user_id
    )
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION get_order_summary IS 'Get order statistics for user or entire system';
-- ==========================================
-- Test the functions
-- ==========================================
-- Test decrement_stock
-- SELECT decrement_stock('product-uuid-here', 5);
-- Test get_low_stock_products
-- SELECT * FROM get_low_stock_products(20);
-- Test get_order_summary
-- SELECT * FROM get_order_summary(NULL, 30);
-- ==========================================
-- Migration Complete ✅
-- ==========================================