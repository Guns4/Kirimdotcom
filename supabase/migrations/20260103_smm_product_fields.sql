-- ============================================
-- SMM PRODUCT FIELDS MIGRATION
-- Tambahan kolom khusus untuk SMM Panel
-- PREREQUISITE: 20260101_marketplace_schema.sql harus dijalankan terlebih dahulu
-- ============================================
-- Cek dan tambah kolom hanya jika belum ada
DO $$ BEGIN -- category_name: Nama kategori SMM (Instagram Follower, TikTok Views, dll)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'category_name'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN category_name VARCHAR(100);
END IF;
-- min_order: Minimum order untuk layanan SMM
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'min_order'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN min_order INT DEFAULT 100;
END IF;
-- max_order: Maximum order untuk layanan SMM
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'max_order'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN max_order INT DEFAULT 10000;
END IF;
-- ref_id: ID dari provider eksternal untuk sinkronisasi
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'ref_id'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN ref_id VARCHAR(50);
END IF;
-- provider_name: Nama provider SMM (idpanel, sosmed-id, dll)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'provider_name'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN provider_name VARCHAR(50);
END IF;
-- rate: Harga per 1000 dari provider (untuk kalkulasi margin)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'rate'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN rate NUMERIC(12, 4);
END IF;
-- average_time: Estimasi waktu pengerjaan (dalam menit)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'average_time'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN average_time VARCHAR(50);
END IF;
-- refill: Garansi refill tersedia atau tidak
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'refill'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN refill BOOLEAN DEFAULT false;
END IF;
-- cancel: Bisa dibatalkan atau tidak
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_products'
        AND column_name = 'cancel'
) THEN
ALTER TABLE public.marketplace_products
ADD COLUMN cancel BOOLEAN DEFAULT false;
END IF;
END $$;
-- Index untuk filtering kategori SMM yang cepat
CREATE INDEX IF NOT EXISTS idx_product_category_name ON public.marketplace_products (category_name);
CREATE INDEX IF NOT EXISTS idx_product_provider ON public.marketplace_products (provider_name);
CREATE INDEX IF NOT EXISTS idx_product_ref_id ON public.marketplace_products (ref_id);
-- Comment untuk dokumentasi
COMMENT ON COLUMN public.marketplace_products.category_name IS 'SMM category name (Instagram Follower, TikTok Views, etc)';
COMMENT ON COLUMN public.marketplace_products.min_order IS 'Minimum order quantity for SMM services';
COMMENT ON COLUMN public.marketplace_products.max_order IS 'Maximum order quantity for SMM services';
COMMENT ON COLUMN public.marketplace_products.ref_id IS 'External provider service ID for sync';
COMMENT ON COLUMN public.marketplace_products.provider_name IS 'SMM provider name (idpanel, sosmed-id, etc)';
COMMENT ON COLUMN public.marketplace_products.rate IS 'Provider rate per 1000 units';
COMMENT ON COLUMN public.marketplace_products.average_time IS 'Estimated processing time';
COMMENT ON COLUMN public.marketplace_products.refill IS 'Whether refill guarantee is available';
COMMENT ON COLUMN public.marketplace_products.cancel IS 'Whether order can be cancelled';
-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================