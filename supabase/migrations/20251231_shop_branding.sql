-- Shop Branding Schema
-- Custom tracking page branding for sellers

CREATE TABLE IF NOT EXISTS shop_branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id TEXT UNIQUE NOT NULL,
    
    -- Branding Assets
    shop_name TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    favicon_url TEXT,
    
    -- Colors
    primary_color TEXT DEFAULT '#3B82F6', -- Blue
    secondary_color TEXT DEFAULT '#10B981', -- Green
    accent_color TEXT DEFAULT '#F59E0B', -- Amber
    background_color TEXT DEFAULT '#FFFFFF',
    text_color TEXT DEFAULT '#1F2937',
    
    -- Custom Content
    tagline TEXT,
    footer_text TEXT,
    whatsapp_number TEXT,
    instagram_handle TEXT,
    
    -- Ad Banner
    ad_banner_url TEXT,
    ad_banner_link TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Subscription
    subscription_status TEXT DEFAULT 'FREE', -- FREE, BRANDING_PRO
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE shop_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own branding"
ON shop_branding FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding"
ON shop_branding FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active branding by shop_id"
ON shop_branding FOR SELECT USING (is_active = true);

-- Indexes
CREATE INDEX idx_shop_branding_user ON shop_branding(user_id);
CREATE INDEX idx_shop_branding_shop_id ON shop_branding(shop_id);
