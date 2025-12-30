-- Shipping Cache Table for Binderbyte/RajaOngkir responses
CREATE TABLE IF NOT EXISTS public.shipping_cache (
    key TEXT PRIMARY KEY, -- Format: origin-destination-weight-courier
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup (though we might use cron to clean old cache)
CREATE INDEX IF NOT EXISTS idx_shipping_cache_created_at ON public.shipping_cache(created_at);
