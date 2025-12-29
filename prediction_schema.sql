-- ============================================================================
-- Prediction Schema: Delivery History for ML
-- Future Enhancement: Use historical data to improve ETA predictions
-- ============================================================================

-- delivery_history Table: Stores actual duration for accuracy
CREATE TABLE IF NOT EXISTS public.delivery_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    waybill text NOT NULL,
    courier text NOT NULL,
    origin_city text,
    dest_city text,
    duration_days numeric, -- e.g. 2.5
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by route
CREATE INDEX IF NOT EXISTS idx_delivery_history_route 
ON public.delivery_history(courier, origin_city, dest_city);

-- Index for performance analytics
CREATE INDEX IF NOT EXISTS idx_delivery_history_created 
ON public.delivery_history(created_at DESC);

-- RLS Policies
ALTER TABLE public.delivery_history ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (for analytics)
CREATE POLICY "Allow authenticated read access"
ON public.delivery_history
FOR SELECT
TO authenticated
USING (true);

-- Only service role can insert/update historical data
CREATE POLICY "Service role full access"
ON public.delivery_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- View: Average delivery duration by route
CREATE OR REPLACE VIEW public.view_avg_delivery_time AS
SELECT 
    courier,
    origin_city,
    dest_city,
    COUNT(*) as delivery_count,
    AVG(duration_days)::numeric(10,2) as avg_duration_days,
    MIN(duration_days)::numeric(10,2) as min_duration_days,
    MAX(duration_days)::numeric(10,2) as max_duration_days
FROM public.delivery_history
WHERE duration_days IS NOT NULL
GROUP BY courier, origin_city, dest_city
HAVING COUNT(*) >= 3; -- Only show routes with at least 3 data points

-- Comment
COMMENT ON TABLE public.delivery_history IS 'Historical delivery data for ML-based ETA predictions';
COMMENT ON VIEW public.view_avg_delivery_time IS 'Aggregated delivery performance by route';
