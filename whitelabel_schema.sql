-- ============================================================================
-- Whitelabel Theme Schema (Phase 124)
-- Dynamic Branding & Multi-Tenant Support
-- ============================================================================

-- 1. Create table if not exists (basic structure)
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns if they don't exist (safe for existing tables)
DO $$
BEGIN
    -- Add logo_url if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN logo_url text;
    END IF;

    -- Add color_primary if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'color_primary'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN color_primary text DEFAULT '#0066CC';
    END IF;

    -- Add color_secondary if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'color_secondary'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN color_secondary text DEFAULT '#f97316';
    END IF;

    -- Add font_family if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'font_family'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN font_family text DEFAULT 'Plus Jakarta Sans';
    END IF;

    -- Add custom_domain if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'custom_domain'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN custom_domain text;
    END IF;

    -- Add is_active if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN is_active boolean DEFAULT true;
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 3. Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON public.tenants(is_active);

-- 4. Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read active tenants" ON public.tenants;
DROP POLICY IF EXISTS "Service role full access to tenants" ON public.tenants;

-- 6. Create policies
CREATE POLICY "Public read active tenants"
ON public.tenants
FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role full access to tenants"
ON public.tenants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Seed Data (only insert if not exists)
INSERT INTO public.tenants (name, slug, color_primary, color_secondary) VALUES
('CekKirim Default', 'default', '#0066CC', '#f97316'),
('Logistik A', 'logistik-a', '#DC2626', '#ef4444'),
('Logistik B', 'logistik-b', '#16A34A', '#22c55e'),
('Cargo Express', 'cargo-express', '#7C3AED', '#a855f7')
ON CONFLICT (slug) DO NOTHING;

-- 8. Create or replace function to get tenant config
CREATE OR REPLACE FUNCTION public.get_tenant_config(p_slug text)
RETURNS TABLE (
    id uuid,
    name text,
    logo_url text,
    color_primary text,
    color_secondary text,
    font_family text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.logo_url,
        t.color_primary,
        t.color_secondary,
        t.font_family
    FROM public.tenants t
    WHERE t.slug = p_slug
    AND t.is_active = true;
END;
$$;

-- 9. Comments
COMMENT ON TABLE public.tenants IS 'Multi-tenant whitelabel configuration';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier for tenant';
COMMENT ON COLUMN public.tenants.color_primary IS 'Primary brand color (hex)';
COMMENT ON COLUMN public.tenants.custom_domain IS 'Custom domain for tenant (e.g., portal.client.com)';

