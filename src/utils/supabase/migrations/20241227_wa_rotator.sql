-- ============================================================================
-- WHATSAPP CS ROTATOR DATABASE SCHEMA
-- Phase 316-320: Free Traffic Tool - WA Link Rotator
-- ============================================================================
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================================================
-- 1. WA ROTATOR LINKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wa_rotator_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner info
    user_id UUID NOT NULL,
    -- Link details
    slug VARCHAR(100) UNIQUE NOT NULL,
    -- e.g., 'toko-baju'
    link_name VARCHAR(255) NOT NULL,
    description TEXT,
    -- WhatsApp numbers (store as JSONB for flexibility)
    cs_numbers JSONB NOT NULL,
    -- Example: [
    --   {"number": "6281234567890", "name": "CS Budi"},
    --   {"number": "6289876543210", "name": "CS Siti"},
    --   {"number": "6287654321098", "name": "CS Ahmad"}
    -- ]
    -- Message template
    default_message TEXT,
    -- Rotation settings
    rotation_type VARCHAR(20) DEFAULT 'round_robin',
    -- 'round_robin', 'random', 'weighted'
    current_index INTEGER DEFAULT 0,
    -- For round-robin tracking
    -- Statistics
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    -- Track if user actually clicked to WA
    -- Ad settings
    show_ads BOOLEAN DEFAULT true,
    custom_banner_url TEXT,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_clicked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_wa_rotator_slug ON public.wa_rotator_links(slug);
CREATE INDEX IF NOT EXISTS idx_wa_rotator_user ON public.wa_rotator_links(user_id);
CREATE INDEX IF NOT EXISTS idx_wa_rotator_active ON public.wa_rotator_links(is_active);
-- ============================================================================
-- 2. WA ROTATOR CLICK LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wa_rotator_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Rotator info
    rotator_id UUID NOT NULL REFERENCES public.wa_rotator_links(id) ON DELETE CASCADE,
    rotator_slug VARCHAR(100) NOT NULL,
    -- Selected CS
    selected_cs_number VARCHAR(20) NOT NULL,
    selected_cs_index INTEGER NOT NULL,
    -- Visitor info
    visitor_ip VARCHAR(45),
    visitor_user_agent TEXT,
    visitor_country VARCHAR(2),
    referrer TEXT,
    -- Conversion tracking
    clicked_to_whatsapp BOOLEAN DEFAULT false,
    -- Did they click the WA button?
    -- Metadata
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_rotator ON public.wa_rotator_clicks(rotator_id);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_slug ON public.wa_rotator_clicks(rotator_slug);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_date ON public.wa_rotator_clicks(clicked_at);
-- ============================================================================
-- 3. FUNCTIONS: Round Robin Rotation
-- ============================================================================
CREATE OR REPLACE FUNCTION get_next_cs_number(rotator_uuid UUID) RETURNS JSONB AS $$
DECLARE rotator_record RECORD;
cs_array JSONB;
total_cs INTEGER;
next_index INTEGER;
selected_cs JSONB;
BEGIN -- Get rotator details
SELECT * INTO rotator_record
FROM public.wa_rotator_links
WHERE id = rotator_uuid
    AND is_active = true;
IF NOT FOUND THEN RETURN NULL;
END IF;
cs_array := rotator_record.cs_numbers;
total_cs := jsonb_array_length(cs_array);
IF total_cs = 0 THEN RETURN NULL;
END IF;
-- Get current index
next_index := rotator_record.current_index;
-- Get selected CS
selected_cs := cs_array->next_index;
-- Update index for next rotation (round robin)
UPDATE public.wa_rotator_links
SET current_index = (next_index + 1) % total_cs,
    total_clicks = total_clicks + 1,
    last_clicked_at = NOW(),
    updated_at = NOW()
WHERE id = rotator_uuid;
-- Return selected CS with index
RETURN jsonb_build_object(
    'cs',
    selected_cs,
    'index',
    next_index,
    'total_cs',
    total_cs
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. SEED DATA: Example Rotator (for testing)
-- ============================================================================
-- Note: This is commented out as we'll create via the UI
-- INSERT INTO public.wa_rotator_links (
--   user_id,
--   slug,
--   link_name,
--   cs_numbers,
--   default_message,
--   is_active
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
--   'demo-toko',
--   'Demo Toko Online',
--   '[
--     {"number": "6281234567890", "name": "CS Budi"},
--     {"number": "6289876543210", "name": "CS Siti"}
--   ]'::jsonb,
--   'Halo! Saya tertarik dengan produk Anda.',
--   true
-- );
-- ============================================================================
-- 5. RLS POLICIES (Row Level Security)
-- ============================================================================
-- WA Rotator links: Users can manage their own
ALTER TABLE public.wa_rotator_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rotator links" ON public.wa_rotator_links FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own rotator links" ON public.wa_rotator_links FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rotator links" ON public.wa_rotator_links FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rotator links" ON public.wa_rotator_links FOR DELETE USING (auth.uid() = user_id);
-- Public read for active rotators (for the redirect page)
CREATE POLICY "Active rotators are publicly viewable" ON public.wa_rotator_links FOR
SELECT USING (is_active = true);
-- WA Rotator clicks: Users can view clicks on their rotators
ALTER TABLE public.wa_rotator_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view clicks on their rotators" ON public.wa_rotator_clicks FOR
SELECT USING (
        rotator_id IN (
            SELECT id
            FROM public.wa_rotator_links
            WHERE user_id = auth.uid()
        )
    );
-- Anyone can insert click logs (for tracking)
CREATE POLICY "Anyone can record clicks" ON public.wa_rotator_clicks FOR
INSERT WITH CHECK (true);
-- ============================================================================
-- 6. HELPER VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW wa_rotator_stats AS
SELECT r.id,
    r.slug,
    r.link_name,
    r.user_id,
    r.total_clicks,
    r.total_conversions,
    jsonb_array_length(r.cs_numbers) as cs_count,
    COUNT(c.id) as logged_clicks,
    COUNT(
        CASE
            WHEN c.clicked_to_whatsapp THEN 1
        END
    ) as whatsapp_clicks,
    CASE
        WHEN r.total_clicks > 0 THEN ROUND(
            (
                r.total_conversions::DECIMAL / r.total_clicks * 100
            ),
            2
        )
        ELSE 0
    END as conversion_rate,
    r.created_at,
    r.last_clicked_at
FROM public.wa_rotator_links r
    LEFT JOIN public.wa_rotator_clicks c ON r.id = c.rotator_id
GROUP BY r.id,
    r.slug,
    r.link_name,
    r.user_id,
    r.total_clicks,
    r.total_conversions,
    r.cs_numbers,
    r.created_at,
    r.last_clicked_at;
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ WhatsApp CS Rotator database schema created successfully!';
RAISE NOTICE '📞 Tables: wa_rotator_links, wa_rotator_clicks';
RAISE NOTICE '🔄 Function: get_next_cs_number() for round-robin rotation';
RAISE NOTICE '📊 View: wa_rotator_stats for analytics';
RAISE NOTICE '🔒 RLS policies enabled for data security';
END $$;