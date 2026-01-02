-- ============================================
-- MARKETPLACE ORDER ITEMS - PROVIDER FIELDS
-- Tambahan kolom untuk tracking status dari SMM Provider
-- PREREQUISITE: 20260101_marketplace_schema.sql harus dijalankan terlebih dahulu
-- ============================================
-- Cek dan tambah kolom hanya jika tabel ada dan kolom belum ada
DO $$ BEGIN -- Cek apakah tabel marketplace_order_items ada
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
) THEN -- provider_order_id: ID order dari provider (MedanPedia, Irvankede, dll)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'provider_order_id'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN provider_order_id VARCHAR(100);
END IF;
-- provider_status: Status dari provider (Success, Partial, Processing, Canceled, dll)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'provider_status'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN provider_status VARCHAR(50);
END IF;
-- provider_start_count: Jumlah awal sebelum order diproses
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'provider_start_count'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN provider_start_count INT;
END IF;
-- provider_remains: Sisa yang belum terkirim (untuk partial)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'provider_remains'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN provider_remains INT;
END IF;
-- provider_charge: Biaya yang dicharge oleh provider
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'provider_charge'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN provider_charge NUMERIC(12, 4);
END IF;
-- last_synced_at: Kapan terakhir sync status dari provider
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'marketplace_order_items'
        AND column_name = 'last_synced_at'
) THEN
ALTER TABLE public.marketplace_order_items
ADD COLUMN last_synced_at TIMESTAMPTZ;
END IF;
RAISE NOTICE 'Provider fields added successfully!';
ELSE RAISE NOTICE 'Table marketplace_order_items does not exist. Run 20260101_marketplace_schema.sql first!';
END IF;
END $$;
-- Index untuk query status provider
CREATE INDEX IF NOT EXISTS idx_order_items_provider_order ON public.marketplace_order_items (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_provider_status ON public.marketplace_order_items (provider_status);
-- Comments
COMMENT ON COLUMN public.marketplace_order_items.provider_order_id IS 'External order ID from SMM provider (MedanPedia, Irvankede, etc)';
COMMENT ON COLUMN public.marketplace_order_items.provider_status IS 'Status from provider: Success, Partial, Processing, Canceled, In progress, Pending';
COMMENT ON COLUMN public.marketplace_order_items.provider_start_count IS 'Initial count before order processing';
COMMENT ON COLUMN public.marketplace_order_items.provider_remains IS 'Remaining quantity not yet delivered (for partial orders)';
COMMENT ON COLUMN public.marketplace_order_items.provider_charge IS 'Actual charge from provider in IDR';
COMMENT ON COLUMN public.marketplace_order_items.last_synced_at IS 'Last time status was synced from provider API';
-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================