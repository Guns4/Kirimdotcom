-- Tracking History Schema
-- Caches tracking results for user history and reduces API calls

CREATE TABLE IF NOT EXISTS public.tracking_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    waybill TEXT NOT NULL,
    courier TEXT NOT NULL,
    status TEXT NOT NULL, -- DELIVERED, ON_PROCESS, etc.
    history JSONB DEFAULT '[]'::JSONB, -- Full tracking timeline
    last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint to identifying tracking items
    CONSTRAINT uq_tracking_waybill_courier UNIQUE (waybill, courier)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tracking_lookup ON public.tracking_history(waybill, courier);

-- RLS
ALTER TABLE public.tracking_history ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (public tracking) or authenticated users
CREATE POLICY "Public read tracking" ON public.tracking_history FOR SELECT USING (true);
CREATE POLICY "Service role manages tracking" ON public.tracking_history FOR ALL USING (true);
