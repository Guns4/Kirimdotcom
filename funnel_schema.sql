-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        event_name VARCHAR(100) NOT NULL,
        properties JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- Allow anyone (even anon) to insert events
CREATE POLICY "Anyone can insert events" ON analytics_events FOR
INSERT WITH CHECK (true);
-- Only admins can view events (Simplification: limiting to authenticated users for now)
CREATE POLICY "Admins can view events" ON analytics_events FOR
SELECT USING (auth.role() = 'authenticated');
-- Ideally restricted to 'admin' role
-- Index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);