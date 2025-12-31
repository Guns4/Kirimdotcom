-- ==========================================
-- Add SMM Service Metadata Fields
-- For automated service synchronization
-- ==========================================
-- Add service-specific columns
ALTER TABLE public.marketplace_products
ADD COLUMN IF NOT EXISTS category_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS min_order INT DEFAULT 100,
    ADD COLUMN IF NOT EXISTS max_order INT DEFAULT 10000,
    ADD COLUMN IF NOT EXISTS ref_id VARCHAR(50);
-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products (category_name)
WHERE category_name IS NOT NULL;
-- Index for ref_id lookup (provider reference)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_ref_id ON public.marketplace_products (ref_id)
WHERE ref_id IS NOT NULL;
-- Comments
COMMENT ON COLUMN public.marketplace_products.category_name IS 'Service category (e.g., Instagram Followers, TikTok Views)';
COMMENT ON COLUMN public.marketplace_products.min_order IS 'Minimum order quantity';
COMMENT ON COLUMN public.marketplace_products.max_order IS 'Maximum order quantity';
COMMENT ON COLUMN public.marketplace_products.ref_id IS 'Provider service ID for sync reference';
-- ==========================================
-- Migration Complete ✅
-- ==========================================