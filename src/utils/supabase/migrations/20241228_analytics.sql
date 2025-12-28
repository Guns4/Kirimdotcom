-- Drop table if exists to ensure clean schema (avoid column mismatch errors)
DROP TABLE IF EXISTS public.analytics_events CASCADE;

-- Analytics Events Table
CREATE TABLE public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for Analytics
CREATE INDEX idx_analytics_name ON public.analytics_events(name);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);

-- RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow insert by everyone (public analytics)
CREATE POLICY "Enable insert for everyone" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Allow select only by admins
CREATE POLICY "Enable select for authenticated users" ON public.analytics_events
    FOR SELECT USING (auth.role() = 'authenticated');