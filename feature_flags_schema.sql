-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS feature_flags (
    key text primary key,
    description text,
    is_enabled boolean default false,
    percentage integer default 100,
    allowed_roles text [],
    -- e.g. ['admin', 'beta_tester']
    updated_at timestamp with time zone default timezone('utc'::text, now())
);
-- Seed Data
INSERT INTO feature_flags (key, description, is_enabled)
VALUES (
        'maintenance_mode',
        'Put site in maintenance',
        false
    ),
    (
        'beta_payment',
        'New payment gateway test',
        false
    ),
    ('promo_banner', 'Top banner for promo', true) ON CONFLICT (key) DO NOTHING;
-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
-- Everyone can read flags (publicly checkable features)
CREATE POLICY "Everyone can read flags" ON feature_flags FOR
SELECT USING (true);
-- Only admins can update
-- (Assuming you have an 'admin' role logic or specific user UUIDs, 
--  for now limiting to authenticated users for simplicity or adjust as needed)
CREATE POLICY "Admins can update flags" ON feature_flags FOR
UPDATE USING (auth.role() = 'authenticated');
-- ideally checking specific admin claim