CREATE TABLE IF NOT EXISTS transit_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    courier TEXT NOT NULL,      -- 'jne', 'jnt', 'sicepat'
    origin_city TEXT NOT NULL,  -- 'Jakarta', 'Bandung'
    dest_city TEXT NOT NULL,    -- 'Surabaya', 'Medan'
    duration_hours INTEGER NOT NULL,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_transit_stats_lookup ON transit_stats(courier, origin_city, dest_city);
