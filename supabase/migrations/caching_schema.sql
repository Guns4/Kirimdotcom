CREATE TABLE IF NOT EXISTS public.shipping_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight INTEGER NOT NULL,
    courier TEXT NOT NULL,
    service TEXT NOT NULL,
    price INTEGER NOT NULL,
    etd TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_shipping_cache_lookup 
ON public.shipping_cache(origin, destination, weight, courier, service);

-- RLS
ALTER TABLE public.shipping_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cache" ON public.shipping_cache FOR SELECT USING (true);
CREATE POLICY "System can insert cache" ON public.shipping_cache FOR INSERT WITH CHECK (true);
