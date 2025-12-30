-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL, -- e.g., 'logistic-corp'
    domain text UNIQUE, -- e.g., 'portal.logistic-corp.com'
    color_primary text DEFAULT '#2563eb', -- Hex Color
    logo_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Link Users to Tenants (Optional, if users belong to a tenant)
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for identification" ON public.tenants FOR SELECT USING (true);
