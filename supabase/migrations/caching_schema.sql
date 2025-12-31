-- Shipping Cache Schema

CREATE TABLE IF NOT EXISTS public.shipping_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origin_code TEXT NOT NULL,      -- City/District ID
    destination_code TEXT NOT NULL, -- District/Sub-district ID
    weight_kg DOUBLE PRECISION NOT NULL,
    courier TEXT NOT NULL,          -- jne, sicepat, etc.
    service TEXT NOT NULL,          -- reg, oke, yes
    price NUMERIC NOT NULL,
    etd TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite Index for super-fast lookups ( < 10ms )
CREATE INDEX IF NOT EXISTS idx_shipping_cache_lookup 
ON public.shipping_cache(origin_code, destination_code, weight_kg, courier);

-- RLS
ALTER TABLE public.shipping_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (or service role)
CREATE POLICY "Service role manages cache" ON public.shipping_cache FOR ALL USING (true);
