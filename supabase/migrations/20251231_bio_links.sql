-- Bio Link Schema
-- Linktree-style pages for sellers

CREATE TABLE IF NOT EXISTS bio_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    
    -- Profile
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    background_color TEXT DEFAULT '#1F2937',
    accent_color TEXT DEFAULT '#3B82F6',
    
    -- Contact
    whatsapp_number TEXT,
    instagram_handle TEXT,
    tiktok_handle TEXT,
    
    -- Settings
    show_resi_tracker BOOLEAN DEFAULT TRUE,
    show_products BOOLEAN DEFAULT TRUE,
    allowed_couriers TEXT[], -- Filter couriers for resi tracker
    
    -- Analytics
    total_views INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bio Links (custom links)
CREATE TABLE IF NOT EXISTS bio_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    sort_order INT DEFAULT 0,
    clicks INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bio Analytics
CREATE TABLE IF NOT EXISTS bio_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- VIEW, LINK_CLICK, WA_CLICK, RESI_CHECK
    link_id UUID REFERENCES bio_links(id),
    visitor_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bio pages" ON bio_pages 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active bio pages" ON bio_pages 
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their bio links" ON bio_links 
FOR ALL USING (bio_page_id IN (SELECT id FROM bio_pages WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their analytics" ON bio_analytics 
FOR SELECT USING (bio_page_id IN (SELECT id FROM bio_pages WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_bio_pages_username ON bio_pages(username);
CREATE INDEX idx_bio_links_page ON bio_links(bio_page_id, sort_order);
CREATE INDEX idx_bio_analytics_page ON bio_analytics(bio_page_id, created_at DESC);
