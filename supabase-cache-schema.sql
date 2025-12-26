-- ============================================
-- CACHE TABLES FOR LOGISTICS API - CLEAN INSTALL
-- ============================================
-- This will DROP and recreate everything cleanly
-- Drop existing function first
DROP FUNCTION IF EXISTS cleanup_stale_cache();
-- Drop existing tables and all dependencies
DROP TABLE IF EXISTS cached_resi CASCADE;
DROP TABLE IF EXISTS cached_ongkir CASCADE;
-- Create cached_resi table
CREATE TABLE cached_resi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resi_number VARCHAR(50) NOT NULL,
    courier_code VARCHAR(20) NOT NULL,
    status_json JSONB NOT NULL,
    current_status VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resi_number, courier_code)
);
-- Create cached_ongkir table
CREATE TABLE cached_ongkir (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_id VARCHAR(20) NOT NULL,
    destination_id VARCHAR(20) NOT NULL,
    weight INTEGER NOT NULL,
    courier_code VARCHAR(20),
    rates_json JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin_id, destination_id, weight, courier_code)
);
-- Create indexes
CREATE INDEX idx_cached_resi_lookup ON cached_resi(resi_number, courier_code);
CREATE INDEX idx_cached_resi_last_updated ON cached_resi(last_updated);
CREATE INDEX idx_cached_ongkir_lookup ON cached_ongkir(origin_id, destination_id, weight);
CREATE INDEX idx_cached_ongkir_last_updated ON cached_ongkir(last_updated);
-- Create cleanup function
CREATE FUNCTION cleanup_stale_cache() RETURNS void AS $$ BEGIN
DELETE FROM cached_resi
WHERE last_updated < NOW() - INTERVAL '7 days';
DELETE FROM cached_ongkir
WHERE last_updated < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
-- Enable RLS
ALTER TABLE cached_resi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_ongkir ENABLE ROW LEVEL SECURITY;
-- RLS Policies for cached_resi
CREATE POLICY "cached_resi_select_policy" ON cached_resi FOR
SELECT TO public USING (true);
CREATE POLICY "cached_resi_insert_policy" ON cached_resi FOR
INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cached_resi_update_policy" ON cached_resi FOR
UPDATE TO authenticated USING (true);
-- RLS Policies for cached_ongkir
CREATE POLICY "cached_ongkir_select_policy" ON cached_ongkir FOR
SELECT TO public USING (true);
CREATE POLICY "cached_ongkir_insert_policy" ON cached_ongkir FOR
INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cached_ongkir_update_policy" ON cached_ongkir FOR
UPDATE TO authenticated USING (true);
-- Success message
SELECT 'Cache tables created successfully!' as status;