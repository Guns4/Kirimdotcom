-- Agent Finder Schema

CREATE TABLE IF NOT EXISTS public.logistics_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    courier_services TEXT[], -- Array of services: ['JNE', 'J&T', 'SiCepat']
    operating_hours TEXT,
    contact_number TEXT,
    submitted_by UUID REFERENCES auth.users(id),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for geospatial queries (simple bounding box for now)
CREATE INDEX IF NOT EXISTS idx_agents_location ON public.logistics_agents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON public.logistics_agents(is_verified);

-- RLS
ALTER TABLE public.logistics_agents ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified agents
CREATE POLICY "Anyone can view verified agents" ON public.logistics_agents FOR SELECT USING (is_verified = true);

-- Authenticated users can submit agents
CREATE POLICY "Users can submit agents" ON public.logistics_agents FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Users can view their own submissions (even if unverified)
CREATE POLICY "Users can view own submissions" ON public.logistics_agents FOR SELECT USING (auth.uid() = submitted_by);
