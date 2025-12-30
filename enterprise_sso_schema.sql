-- 1. Table to map Domains to SSO Configurations
CREATE TABLE IF NOT EXISTS public.enterprise_sso_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL, -- e.g., 'logistik-a.com'
    sso_provider TEXT, -- 'azure', 'google', 'okta', 'saml'
    provider_id TEXT, -- Supabase SSO provider ID
    redirect_url TEXT, -- Custom landing page after login
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_sso_config_domain ON public.enterprise_sso_config(domain);

-- Enable RLS
ALTER TABLE public.enterprise_sso_config ENABLE ROW LEVEL SECURITY;

-- Anyone can check if domain exists (for login flow)
DROP POLICY IF EXISTS "Anyone can check domain" ON public.enterprise_sso_config;
CREATE POLICY "Anyone can check domain" ON public.enterprise_sso_config
FOR SELECT USING (is_active = true);

-- Only admins can manage
DROP POLICY IF EXISTS "Admins manage SSO config" ON public.enterprise_sso_config;
CREATE POLICY "Admins manage SSO config" ON public.enterprise_sso_config
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_role = 'admin'
    )
);

-- 2. User Roles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user',
    organization_id UUID REFERENCES public.enterprise_sso_config(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- 3. Auto-Provisioning Function
CREATE OR REPLACE FUNCTION public.handle_enterprise_new_user()
RETURNS TRIGGER AS $$
DECLARE
    matched_org_id UUID;
    user_domain TEXT;
BEGIN
    -- Extract domain from email
    user_domain := split_part(NEW.email, '@', 2);
    
    -- Check if domain matches an enterprise config
    SELECT id INTO matched_org_id
    FROM public.enterprise_sso_config
    WHERE domain = user_domain AND is_active = true;

    IF matched_org_id IS NOT NULL THEN
        -- Assign 'staff' role and link to organization
        INSERT INTO public.user_roles (user_id, role, organization_id)
        VALUES (NEW.id, 'staff', matched_org_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            organization_id = matched_org_id,
            role = 'staff';
        
        -- Update profile with organization info
        UPDATE public.profiles 
        SET user_role = 'staff'
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger on auth.users requires elevated permissions
-- Run this in Supabase Dashboard SQL Editor with appropriate role
-- DROP TRIGGER IF EXISTS trg_enterprise_provisioning ON auth.users;
-- CREATE TRIGGER trg_enterprise_provisioning
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.handle_enterprise_new_user();

-- 4. Seed Example Data
INSERT INTO public.enterprise_sso_config (organization_name, domain, sso_provider, redirect_url)
VALUES 
    ('Logistik A Corp', 'logistik-a.com', 'azure', '/dashboard/corp-a'),
    ('Global Shipping Ltd', 'global-shipping.com', 'google', '/dashboard/global'),
    ('Fast Express', 'fastexpress.co.id', 'okta', '/dashboard/express')
ON CONFLICT (domain) DO NOTHING;
