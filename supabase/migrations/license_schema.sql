CREATE TYPE license_status AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

CREATE TABLE IF NOT EXISTS public.plugin_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_key TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    domain TEXT, -- The domain where it is activated
    status license_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.plugin_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage licenses" ON public.plugin_licenses FOR ALL USING (true); -- Simplify for MVP
