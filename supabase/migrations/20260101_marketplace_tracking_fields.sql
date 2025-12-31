-- ==========================================
-- Add Tracking Fields to Orders Table
-- For physical product shipping
-- ==========================================
-- Add tracking number and courier fields
ALTER TABLE public.marketplace_orders
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS courier_used VARCHAR(50),
    ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
-- Index for tracking lookup
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_tracking ON public.marketplace_orders (tracking_number)
WHERE tracking_number IS NOT NULL;
-- Comments
COMMENT ON COLUMN public.marketplace_orders.tracking_number IS 'Shipping tracking number (resi) for physical products';
COMMENT ON COLUMN public.marketplace_orders.courier_used IS 'Courier service used (JNE, JNT, SiCepat, etc.)';
COMMENT ON COLUMN public.marketplace_orders.shipped_at IS 'Timestamp when order was shipped';
-- ==========================================
-- Migration Complete ✅
-- ==========================================