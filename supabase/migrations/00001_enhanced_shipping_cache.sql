-- Enhanced Shipping Cache Schema
-- Optimized for fast lookups and cost savings
-- 1. TABEL CACHE ONGKIR (Anti-Boncos System)
CREATE TABLE IF NOT EXISTS public.shipping_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    weight INT NOT NULL,
    courier VARCHAR(20) NOT NULL,
    service VARCHAR(20) NOT NULL,
    price NUMERIC NOT NULL,
    etd VARCHAR(50),
    price_data JSONB,
    -- Full vendor response for debugging
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    hit_count INT DEFAULT 0 -- Track cache usage
);
-- Index untuk pencarian cache super cepat (<10ms)
CREATE INDEX IF NOT EXISTS idx_shipping_cache_search ON public.shipping_cache (origin, destination, weight, courier, service)
WHERE expires_at > NOW();
-- Index untuk cleanup expired cache
CREATE INDEX IF NOT EXISTS idx_shipping_cache_expires ON public.shipping_cache (expires_at);
-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_shipping_cache_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger untuk auto-update
DROP TRIGGER IF EXISTS trigger_shipping_cache_timestamp ON public.shipping_cache;
CREATE TRIGGER trigger_shipping_cache_timestamp BEFORE
UPDATE ON public.shipping_cache FOR EACH ROW EXECUTE FUNCTION update_shipping_cache_timestamp();
-- Function untuk cleanup expired cache (jalankan via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_shipping_cache() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
DELETE FROM public.shipping_cache
WHERE expires_at < NOW();
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Comment untuk dokumentasi
COMMENT ON TABLE public.shipping_cache IS 'Cache untuk ongkir API - hemat biaya vendor API';
COMMENT ON COLUMN public.shipping_cache.price_data IS 'Full JSON response dari vendor untuk debugging';
COMMENT ON COLUMN public.shipping_cache.hit_count IS 'Jumlah kali cache ini digunakan (ROI tracking)';
COMMENT ON COLUMN public.shipping_cache.expires_at IS 'Cache expired setelah 7 hari - refresh otomatis';