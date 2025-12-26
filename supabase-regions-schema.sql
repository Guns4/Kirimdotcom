-- ============================================
-- INDONESIA REGIONS DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- Table for provinces
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);
-- Table for cities/regencies
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    province_id INTEGER REFERENCES provinces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    -- 'Kota' or 'Kabupaten'
    postal_code VARCHAR(10)
);
-- Table for districts (kecamatan)
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10)
);
-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);
CREATE INDEX IF NOT EXISTS idx_districts_city ON districts(city_id);
-- Full text search index for district search
CREATE INDEX IF NOT EXISTS idx_districts_search ON districts USING gin(to_tsvector('indonesian', name));
-- View for combined search
CREATE OR REPLACE VIEW area_search AS
SELECT d.id as district_id,
    d.name as district_name,
    c.id as city_id,
    c.name as city_name,
    c.type as city_type,
    p.id as province_id,
    p.name as province_name,
    COALESCE(d.postal_code, c.postal_code) as postal_code,
    d.name || ', ' || c.type || ' ' || c.name || ', ' || p.name as full_name
FROM districts d
    JOIN cities c ON d.city_id = c.id
    JOIN provinces p ON c.province_id = p.id;
-- Function to search areas (fuzzy search)
CREATE OR REPLACE FUNCTION search_areas(
        search_query TEXT,
        result_limit INTEGER DEFAULT 20
    ) RETURNS TABLE(
        district_id INTEGER,
        district_name VARCHAR,
        city_id INTEGER,
        city_name VARCHAR,
        city_type VARCHAR,
        province_id INTEGER,
        province_name VARCHAR,
        postal_code VARCHAR,
        full_name TEXT,
        relevance REAL
    ) AS $$ BEGIN RETURN QUERY
SELECT a.district_id::INTEGER,
    a.district_name::VARCHAR,
    a.city_id::INTEGER,
    a.city_name::VARCHAR,
    a.city_type::VARCHAR,
    a.province_id::INTEGER,
    a.province_name::VARCHAR,
    a.postal_code::VARCHAR,
    a.full_name::TEXT,
    similarity(
        LOWER(a.district_name || ' ' || a.city_name),
        LOWER(search_query)
    )::REAL as relevance
FROM area_search a
WHERE LOWER(a.district_name) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(a.city_name) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(a.province_name) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(a.full_name) LIKE '%' || LOWER(search_query) || '%'
ORDER BY CASE
        WHEN LOWER(a.district_name) = LOWER(search_query) THEN 0
        WHEN LOWER(a.district_name) LIKE LOWER(search_query) || '%' THEN 1
        WHEN LOWER(a.city_name) LIKE LOWER(search_query) || '%' THEN 2
        ELSE 3
    END,
    relevance DESC
LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
-- Enable pg_trgm extension for fuzzy search (if not exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- RLS Policies (Read only for all)
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read provinces" ON provinces FOR
SELECT USING (true);
CREATE POLICY "Public read cities" ON cities FOR
SELECT USING (true);
CREATE POLICY "Public read districts" ON districts FOR
SELECT USING (true);