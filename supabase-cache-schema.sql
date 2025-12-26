-- ============================================
-- CACHE TABLES FOR LOGISTICS API
-- ============================================
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- These tables cache API responses to minimize costs
-- Table: cached_resi (Tracking/Resi Cache)
CREATE TABLE IF NOT EXISTS cached_resi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Query identifiers
    resi_number VARCHAR(50) NOT NULL,
    courier_code VARCHAR(20) NOT NULL,
    -- Cached response data
    status_json JSONB NOT NULL,
    current_status VARCHAR(100),
    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(resi_number, courier_code)
);
-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_cached_resi_lookup ON cached_resi(resi_number, courier_code);
CREATE INDEX IF NOT EXISTS idx_cached_resi_last_updated ON cached_resi(last_updated);
-- Table: cached_ongkir (Shipping Cost Cache)
CREATE TABLE IF NOT EXISTS cached_ongkir (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Query parameters
    origin_id VARCHAR(20) NOT NULL,
    destination_id VARCHAR(20) NOT NULL,
    weight INTEGER NOT NULL,
    courier_code VARCHAR(20),
    -- Cached response data
    rates_json JSONB NOT NULL,
    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(origin_id, destination_id, weight, courier_code)
);
-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_cached_ongkir_lookup ON cached_ongkir(origin_id, destination_id, weight);
CREATE INDEX IF NOT EXISTS idx_cached_ongkir_last_updated ON cached_ongkir(last_updated);
-- Function to clean up stale cache (optional - run periodically)
CREATE OR REPLACE FUNCTION cleanup_stale_cache() RETURNS void AS $$ BEGIN -- Delete resi cache older than 7 days
DELETE FROM cached_resi
WHERE last_updated < NOW() - INTERVAL '7 days';
-- Delete ongkir cache older than 30 days
DELETE FROM cached_ongkir
WHERE last_updated < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
-- RLS Policies (Public read, authenticated write)
ALTER TABLE cached_resi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_ongkir ENABLE ROW LEVEL SECURITY;
-- Allow all to read cache (optimize performance)
CREATE POLICY "Allow public read on cached_resi" ON cached_resi FOR
SELECT USING (true);
CREATE POLICY "Allow public read on cached_ongkir" ON cached_ongkir FOR
SELECT USING (true);
-- Only authenticated users can write cache
CREATE POLICY "Allow authenticated insert on cached_resi" ON cached_resi FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on cached_resi" ON cached_resi FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on cached_ongkir" ON cached_ongkir FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on cached_ongkir" ON cached_ongkir FOR
UPDATE USING (auth.role() = 'authenticated');
-- ============================================
-- COMPLETED
-- ============================================
-- Cache tables ready for use!
-- Run cleanup_stale_cache() periodically via cron job