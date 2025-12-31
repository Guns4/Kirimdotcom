-- ==========================================
-- Add Provider Tracking Fields to Order Items
-- For SMM order status synchronization
-- ==========================================
-- Add provider tracking columns
ALTER TABLE public.marketplace_order_items
ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS provider_status VARCHAR(50);
-- Index for provider order lookup
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_provider ON public.marketplace_order_items (provider_order_id)
WHERE provider_order_id IS NOT NULL;
-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_status ON public.marketplace_order_items (status, product_type)
WHERE product_type LIKE 'DIGITAL%';
-- Comments
COMMENT ON COLUMN public.marketplace_order_items.provider_order_id IS 'Order ID from SMM provider (MedanPedia, IrvanKede, etc.)';
COMMENT ON COLUMN public.marketplace_order_items.provider_status IS 'Status from provider (Success, Partial, Processing, Failed)';
-- ==========================================
-- Migration Complete ✅
-- ==========================================