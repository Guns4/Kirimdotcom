-- ==========================================
-- Add Provider Monitoring Fields
-- For SMM order status tracking and refunds
-- ==========================================
-- Add tracking columns to order items
ALTER TABLE public.marketplace_order_items
ADD COLUMN IF NOT EXISTS provider_start_count INT,
    ADD COLUMN IF NOT EXISTS provider_remains INT;
-- Comments
COMMENT ON COLUMN public.marketplace_order_items.provider_start_count IS 'Initial count when SMM service started (e.g., current followers)';
COMMENT ON COLUMN public.marketplace_order_items.provider_remains IS 'Remaining quantity not delivered (for partial orders)';
-- ==========================================
-- Storage Bucket for Product Images
-- ==========================================
-- Create marketplace storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace', 'marketplace', true) ON CONFLICT (id) DO NOTHING;
-- Policy: Public can view images
CREATE POLICY IF NOT EXISTS "Public Access marketplace" ON storage.objects FOR
SELECT USING (bucket_id = 'marketplace');
-- Policy: Authenticated users (admin) can upload
CREATE POLICY IF NOT EXISTS "Admin Upload marketplace" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'marketplace'
        AND auth.role() = 'authenticated'
    );
-- Policy: Authenticated users can update
CREATE POLICY IF NOT EXISTS "Admin Update marketplace" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'marketplace'
        AND auth.role() = 'authenticated'
    );
-- Policy: Authenticated users can delete
CREATE POLICY IF NOT EXISTS "Admin Delete marketplace" ON storage.objects FOR DELETE USING (
    bucket_id = 'marketplace'
    AND auth.role() = 'authenticated'
);
-- ==========================================
-- Add image_url column if not exists
-- ==========================================
ALTER TABLE public.marketplace_products
ADD COLUMN IF NOT EXISTS image_url TEXT [];
COMMENT ON COLUMN public.marketplace_products.image_url IS 'Array of product image URLs from storage';
-- ==========================================
-- Migration Complete ✅
-- ==========================================