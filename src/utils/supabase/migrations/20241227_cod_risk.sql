-- Create table for Postal Code Risk Zones
CREATE TABLE IF NOT EXISTS public.cod_risk_zones (
    postal_code TEXT PRIMARY KEY,
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
    province TEXT,
    city TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Search index for postal codes
CREATE INDEX IF NOT EXISTS idx_cod_risk_postal ON public.cod_risk_zones(postal_code);
-- Enable RLS
ALTER TABLE public.cod_risk_zones ENABLE ROW LEVEL SECURITY;
-- Allow public read access to risk zones
CREATE POLICY "Allow public read access" ON public.cod_risk_zones FOR
SELECT USING (true);
-- Create table for Reported Buyers (Privacy Preserved via Hash)
CREATE TABLE IF NOT EXISTS public.reported_buyers (
    phone_hash TEXT PRIMARY KEY,
    -- SHA-256 of normalized phone number
    report_count INTEGER DEFAULT 1,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Enable RLS
ALTER TABLE public.reported_buyers ENABLE ROW LEVEL SECURITY;
-- Allow public read access to check reports
CREATE POLICY "Allow public read access" ON public.reported_buyers FOR
SELECT USING (true);
-- Allow authenticated users (or public depending on policy) to update??
-- Ideally, updates should happen via a secure backend function or specific policy.
-- For now, we will rely on Server Actions with Service Role for updates to prevent abuse.
-- Create table for Report Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.buyer_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_hash TEXT NOT NULL,
    reason TEXT,
    reporter_ip TEXT,
    -- To prevent spam reporting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Enable RLS
ALTER TABLE public.buyer_reports ENABLE ROW LEVEL SECURITY;
-- Only allow insert (reporting)
CREATE POLICY "Allow public insert" ON public.buyer_reports FOR
INSERT WITH CHECK (true);