-- =====================================================
-- STOCK PREDICTION SCHEMA
-- Note: This view requires order tracking data
-- =====================================================

-- 1. Create order_items table if not exists (optional - for stock tracking)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2),
    total_price NUMERIC(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Service role full access" ON public.order_items;
CREATE POLICY "Service role full access" ON public.order_items
FOR ALL USING (auth.role() = 'service_role');

-- 2. Inventory Forecast View (Stock Prediction)
CREATE OR REPLACE VIEW public.inventory_forecast AS
WITH daily_sales_last_7_days AS (
    SELECT 
        product_id, 
        SUM(quantity) as total_sold
    FROM public.order_items
    JOIN public.orders ON order_items.order_id = orders.id
    WHERE orders.created_at >= (now() - interval '7 days')
      AND orders.order_status = 'completed'
    GROUP BY product_id
),
product_velocity AS (
    SELECT
        p.id as product_id,
        p.product_name,
        p.stock as current_stock,
        p.selling_price as price,
        COALESCE(ds.total_sold, 0) / 7.0 as daily_run_rate
    FROM public.products p
    LEFT JOIN daily_sales_last_7_days ds ON p.id = ds.product_id
    WHERE p.is_active = true
)
SELECT
    product_id,
    product_name,
    current_stock,
    price,
    ROUND(daily_run_rate::numeric, 2) as daily_run_rate,
    
    -- Calculation: Days Until Out of Stock
    CASE 
        WHEN daily_run_rate <= 0 THEN 999
        ELSE FLOOR(current_stock / daily_run_rate)::integer
    END as days_remaining,
    
    -- Alert Flag
    CASE 
        WHEN daily_run_rate > 0 AND (current_stock / daily_run_rate) < 3 THEN 'CRITICAL'
        WHEN daily_run_rate > 0 AND (current_stock / daily_run_rate) < 7 THEN 'WARNING'
        ELSE 'SAFE'
    END as status,
    
    -- Recommended Restock Quantity (7 days worth of sales)
    CASE
        WHEN daily_run_rate > 0 THEN CEIL(daily_run_rate * 7)::integer
        ELSE 0
    END as recommended_restock

FROM product_velocity
WHERE daily_run_rate > 0;

-- Grant access to authenticated users
GRANT SELECT ON public.inventory_forecast TO authenticated;
