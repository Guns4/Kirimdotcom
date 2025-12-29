-- Ensure Tenants Table Exists
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color_primary TEXT DEFAULT '#4F46E5',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Sample Data
INSERT INTO public.tenants (id, name, slug, color_primary, logo_url)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Logistik A', 'logistik-a', '#DC2626', 'https://via.placeholder.com/150')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can update their own data
CREATE POLICY "Tenants can update own data" ON public.tenants
    FOR UPDATE USING (true); -- In production, add proper auth check
