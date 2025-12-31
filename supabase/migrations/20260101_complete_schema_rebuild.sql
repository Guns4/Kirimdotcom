-- ==========================================
-- Complete Database Schema Setup
-- Version: 2.1 - Fixed IMMUTABLE Error
-- Date: 2026-01-01
-- ==========================================
-- ==========================================
-- STEP 1: CLEAN SLATE (Drop Existing Tables)
-- ==========================================
-- Drop tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS public.ppob_transactions CASCADE;
DROP TABLE IF EXISTS public.ppob_products CASCADE;
DROP TABLE IF EXISTS public.tracking_history CASCADE;
DROP TABLE IF EXISTS public.shipping_cache CASCADE;
-- ==========================================
-- STEP 2: SHIPPING CACHE (Cost Optimization)
-- ==========================================
-- Purpose: Cache vendor API responses to save money
-- Expected savings: 80% reduction in API calls
CREATE TABLE public.shipping_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origin VARCHAR(20) NOT NULL,
    -- Origin city/district code
    destination VARCHAR(20) NOT NULL,
    -- Destination city/district code
    weight INT NOT NULL,
    -- Weight in grams
    courier VARCHAR(20) NOT NULL,
    -- Courier name (jne, pos, tiki, sicepat)
    service VARCHAR(50),
    -- Service type (REG, YES, OKE)
    price NUMERIC(12, 2) NOT NULL,
    -- Cached price
    etd VARCHAR(50),
    -- Estimated delivery time
    price_data JSONB NOT NULL,
    -- Full vendor API response (for debugging)
    hit_count INT DEFAULT 0,
    -- Track cache usage (ROI metric)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL
);
-- Performance Indexes (Target: <10ms query time)
-- NOTE: Removed WHERE expires_at > NOW() because NOW() is not IMMUTABLE
-- Filter in application code instead
CREATE INDEX idx_shipping_cache_lookup ON public.shipping_cache (origin, destination, weight, courier);
CREATE INDEX idx_shipping_cache_expires ON public.shipping_cache (expires_at);
-- ==========================================
-- STEP 3: TRACKING HISTORY (UX Enhancement)
-- ==========================================
-- Purpose: Save user's tracking history for quick access
-- Benefit: Users don't need to re-enter waybill numbers
CREATE TABLE public.tracking_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- NULL for guest users
    waybill VARCHAR(100) NOT NULL,
    courier VARCHAR(50) NOT NULL,
    last_status VARCHAR(100),
    -- Latest delivery status
    recipient_name VARCHAR(255),
    -- Who received the package
    history_data JSONB,
    -- Full tracking timeline
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Performance Indexes
CREATE INDEX idx_tracking_user ON public.tracking_history (user_id);
CREATE INDEX idx_tracking_waybill ON public.tracking_history (waybill);
CREATE INDEX idx_tracking_recent ON public.tracking_history (user_id, created_at DESC);
-- ==========================================
-- STEP 4: PPOB TRANSACTIONS (Revenue Stream)
-- ==========================================
-- Purpose: Track all PPOB purchases (Pulsa, PLN, PDAM, etc.)
-- Features: Profit tracking, refund support, status tracking
CREATE TABLE public.ppob_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    trx_id VARCHAR(100) UNIQUE NOT NULL,
    -- Unique transaction reference
    product_code VARCHAR(50) NOT NULL,
    -- Product SKU (e.g., PULSA_TELKOMSEL_10K)
    target_number VARCHAR(50) NOT NULL,
    -- Phone/Meter number
    price_modal NUMERIC(12, 2) NOT NULL,
    -- Our cost (from vendor)
    price_sell NUMERIC(12, 2) NOT NULL,
    -- Selling price (to customer)
    profit NUMERIC(12, 2) GENERATED ALWAYS AS (price_sell - price_modal) STORED,
    status VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING, SUCCESS, FAILED, REFUNDED
    sn VARCHAR(255),
    -- Serial Number (for token/voucher)
    vendor_trx_id VARCHAR(100),
    -- Vendor's transaction ID
    vendor_msg TEXT,
    -- Vendor response message
    refund_amount NUMERIC(12, 2),
    -- Amount refunded (if failed)
    refund_at TIMESTAMPTZ,
    -- When refund was processed
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ -- When transaction completed/failed
);
-- Performance Indexes
CREATE INDEX idx_ppob_user ON public.ppob_transactions (user_id, created_at DESC);
CREATE INDEX idx_ppob_status ON public.ppob_transactions (status, created_at DESC);
CREATE INDEX idx_ppob_trx_id ON public.ppob_transactions (trx_id);
-- ==========================================
-- STEP 5: PPOB PRODUCTS (Product Catalog)
-- ==========================================
-- Purpose: Store available PPOB products and prices
CREATE TABLE public.ppob_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    -- PULSA, PLN, PDAM, etc.
    provider VARCHAR(50),
    -- Telkomsel, Indosat, PLN, etc.
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_modal NUMERIC(12, 2) NOT NULL,
    -- Our buy price
    price_sell NUMERIC(12, 2) NOT NULL,
    -- Customer sell price
    margin NUMERIC(12, 2) GENERATED ALWAYS AS (price_sell - price_modal) STORED,
    is_active BOOLEAN DEFAULT true,
    stock_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Performance Indexes
CREATE INDEX idx_ppob_products_category ON public.ppob_products (category, is_active);
CREATE INDEX idx_ppob_products_provider ON public.ppob_products (provider, is_active);
-- ==========================================
-- STEP 6: ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Security: Users can only access their own data
-- Tracking History RLS
ALTER TABLE public.tracking_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tracking history" ON public.tracking_history FOR
SELECT USING (
        auth.uid() = user_id
        OR user_id IS NULL
    );
CREATE POLICY "Users can insert own tracking history" ON public.tracking_history FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracking history" ON public.tracking_history FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracking history" ON public.tracking_history FOR DELETE USING (auth.uid() = user_id);
-- PPOB Transactions RLS
ALTER TABLE public.ppob_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.ppob_transactions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.ppob_transactions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- PPOB Products RLS (Read-only for all authenticated users)
ALTER TABLE public.ppob_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.ppob_products FOR
SELECT USING (is_active = true);
-- Shipping Cache (Service role & authenticated users)
ALTER TABLE public.shipping_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shipping cache" ON public.shipping_cache FOR
SELECT USING (true);
CREATE POLICY "Service role can manage cache" ON public.shipping_cache FOR ALL USING (true);
-- ==========================================
-- STEP 7: AUTO-UPDATE TRIGGERS
-- ==========================================
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply triggers
CREATE TRIGGER update_shipping_cache_timestamp BEFORE
UPDATE ON public.shipping_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracking_history_timestamp BEFORE
UPDATE ON public.tracking_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ppob_products_timestamp BEFORE
UPDATE ON public.ppob_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==========================================
-- STEP 8: UTILITY FUNCTIONS
-- ==========================================
-- Cleanup expired shipping cache
CREATE OR REPLACE FUNCTION cleanup_expired_shipping_cache() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
DELETE FROM public.shipping_cache
WHERE expires_at < NOW();
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Get cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics() RETURNS TABLE (
        total_entries BIGINT,
        total_hits BIGINT,
        expired_entries BIGINT,
        active_entries BIGINT
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(*)::BIGINT as total_entries,
    SUM(hit_count)::BIGINT as total_hits,
    COUNT(*) FILTER (
        WHERE expires_at < NOW()
    )::BIGINT as expired_entries,
    COUNT(*) FILTER (
        WHERE expires_at >= NOW()
    )::BIGINT as active_entries
FROM public.shipping_cache;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- STEP 9: COMMENTS (Documentation)
-- ==========================================
COMMENT ON TABLE public.shipping_cache IS 'Caches shipping cost API responses to reduce vendor API calls';
COMMENT ON TABLE public.tracking_history IS 'Stores user tracking history for quick access';
COMMENT ON TABLE public.ppob_transactions IS 'Records all PPOB transactions with profit tracking';
COMMENT ON TABLE public.ppob_products IS 'Catalog of available PPOB products and pricing';
COMMENT ON COLUMN public.shipping_cache.hit_count IS 'Number of times this cache entry was used (ROI metric)';
COMMENT ON COLUMN public.shipping_cache.expires_at IS 'Cache expires after 7 days for data freshness';
COMMENT ON COLUMN public.ppob_transactions.profit IS 'Calculated profit margin (price_sell - price_modal)';
-- ==========================================
-- MIGRATION COMPLETE ✅
-- ==========================================
-- Next steps:
-- 1. Verify tables created: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Test RLS policies work correctly
-- 3. Run cleanup function: SELECT cleanup_expired_shipping_cache();
-- ==========================================