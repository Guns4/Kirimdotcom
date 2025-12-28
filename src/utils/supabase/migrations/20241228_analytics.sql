-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    -- For guest tracking
    page_url TEXT,
    user_agent TEXT
);
-- Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- Allow insert by anyone (anon + auth)
CREATE POLICY "Allow public insert" ON analytics_events FOR
INSERT TO public WITH CHECK (true);
-- Allow viewing only by admins (you might need to adjust this depending on your admin role logic)
-- Assuming 'admins' table or similar logic exists, or just manually restricted for now
CREATE POLICY "Allow view by admins only" ON analytics_events FOR
SELECT TO authenticated USING (
        auth.uid() IN (
            SELECT id
            FROM users
            WHERE role = 'admin'
        )
    );
-- Adjust 'users' table logic if different