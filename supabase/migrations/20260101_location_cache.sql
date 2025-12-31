-- ==========================================
-- Location Cache Table
-- For storing district/subdistrict data
-- ==========================================
CREATE TABLE IF NOT EXISTS public.location_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    -- District code (e.g., "bdg-cbr")
    name VARCHAR(255) NOT NULL,
    -- District name (e.g., "Cibiru, Bandung")
    province VARCHAR(100),
    -- Province name
    city VARCHAR(100),
    -- City name
    district VARCHAR(100),
    -- District name
    type VARCHAR(20),
    -- Type: city, district, subdistrict
    postal_code VARCHAR(10),
    -- Postal code
    full_name TEXT,
    -- Full formatted name
    metadata JSONB,
    -- Additional data from vendor
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_location_cache_name ON public.location_cache USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_location_cache_code ON public.location_cache (code);
CREATE INDEX IF NOT EXISTS idx_location_cache_province ON public.location_cache (province);
CREATE INDEX IF NOT EXISTS idx_location_cache_city ON public.location_cache (city);
-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Auto-update timestamp trigger
CREATE TRIGGER update_location_cache_timestamp BEFORE
UPDATE ON public.location_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS (Public read access)
ALTER TABLE public.location_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read locations" ON public.location_cache FOR
SELECT USING (true);
CREATE POLICY "Service role can manage locations" ON public.location_cache FOR ALL USING (true);
-- Comments
COMMENT ON TABLE public.location_cache IS 'Cache for district/subdistrict location data to reduce vendor API calls';
COMMENT ON COLUMN public.location_cache.code IS 'Unique district code from vendor';
COMMENT ON COLUMN public.location_cache.full_name IS 'Full formatted name for display';
-- ==========================================
-- Helper function for location search
-- ==========================================
CREATE OR REPLACE FUNCTION search_locations(search_query TEXT, result_limit INT DEFAULT 10) RETURNS TABLE (
        code VARCHAR,
        name VARCHAR,
        province VARCHAR,
        city VARCHAR,
        district VARCHAR,
        full_name TEXT,
        similarity_score REAL
    ) AS $$ BEGIN RETURN QUERY
SELECT l.code,
    l.name,
    l.province,
    l.city,
    l.district,
    l.full_name,
    similarity(l.name, search_query) as similarity_score
FROM public.location_cache l
WHERE l.name ILIKE '%' || search_query || '%'
    OR l.city ILIKE '%' || search_query || '%'
    OR l.province ILIKE '%' || search_query || '%'
ORDER BY similarity(l.name, search_query) DESC,
    l.name ASC
LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- Sample data (Optional - for testing)
-- ==========================================
-- Uncomment to insert sample locations
/*
 INSERT INTO public.location_cache (code, name, province, city, district, full_name) VALUES
 ('jkt-cbd', 'Cempaka Putih Barat, Jakarta Pusat', 'DKI Jakarta', 'Jakarta Pusat', 'Cempaka Putih Barat', 'Cempaka Putih Barat, Jakarta Pusat, DKI Jakarta'),
 ('bdg-cbr', 'Cibiru, Bandung', 'Jawa Barat', 'Bandung', 'Cibiru', 'Cibiru, Bandung, Jawa Barat'),
 ('sby-rks', 'Rungkut, Surabaya', 'Jawa Timur', 'Surabaya', 'Rungkut', 'Rungkut, Surabaya, Jawa Timur')
 ON CONFLICT (code) DO NOTHING;
 */