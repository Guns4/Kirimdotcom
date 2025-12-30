-- Whitelabel SaaS Schema
-- Tenant branding for B2B clients

CREATE TABLE IF NOT EXISTS saas_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Branding
    brand_name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    
    -- Domain (for future use)
    custom_domain TEXT UNIQUE,
    
    -- Settings
    hide_footer BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE saas_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their tenant settings" ON saas_tenants
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read by domain" ON saas_tenants
FOR SELECT USING (true); -- Allow public read to resolve tenant by domain

-- Indexes
CREATE INDEX idx_saas_tenants_domain ON saas_tenants(custom_domain);
CREATE INDEX idx_saas_tenants_user ON saas_tenants(user_id);
