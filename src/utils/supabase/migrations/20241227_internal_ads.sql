-- ============================================================================
-- INTERNAL ADS SYSTEM
-- Phase 341-345: Seller Promotions & Ad Management
-- ============================================================================
-- ============================================================================
-- 1. AD CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Advertiser info
    advertiser_id UUID NOT NULL,
    advertiser_name VARCHAR(255) NOT NULL,
    advertiser_email VARCHAR(255),
    -- Campaign details
    campaign_name VARCHAR(255) NOT NULL,
    banner_url TEXT NOT NULL,
    -- URL to banner image
    target_url TEXT NOT NULL,
    -- Where ad redirects to
    -- Ad slot placement
    slot_position VARCHAR(50) NOT NULL,
    -- 'sidebar', 'below_tracking', 'homepage', 'blog'
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    -- Budget & Pricing
    budget_type VARCHAR(20) DEFAULT 'flat',
    -- 'flat', 'cpc', 'cpm'
    price_paid DECIMAL(10, 2) DEFAULT 0.00,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'active', 'paused', 'completed', 'rejected'
    is_approved BOOLEAN DEFAULT false,
    -- Stats (cached for quick access)
    total_impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN total_impressions > 0 THEN ROUND(
                (total_clicks::DECIMAL / total_impressions * 100),
                2
            )
            ELSE 0
        END
    ) STORED,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID
);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON public.ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_slot ON public.ad_campaigns(slot_position);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);
-- ============================================================================
-- 2. AD IMPRESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_impressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Campaign reference
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    -- Viewer info
    viewer_ip VARCHAR(45),
    viewer_user_agent TEXT,
    viewer_country VARCHAR(2),
    -- Context
    page_url TEXT,
    referrer TEXT,
    -- Timestamp
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_date ON public.ad_impressions(viewed_at);
-- ============================================================================
-- 3. AD CLICKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Campaign reference
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    -- Clicker info
    clicker_ip VARCHAR(45),
    clicker_user_agent TEXT,
    clicker_country VARCHAR(2),
    -- Context
    source_page TEXT,
    referrer TEXT,
    -- Timestamp
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_campaign ON public.ad_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_date ON public.ad_clicks(clicked_at);
-- ============================================================================
-- 4. FUNCTIONS: Get Active Ad for Slot
-- ============================================================================
CREATE OR REPLACE FUNCTION get_active_ad_for_slot(p_slot_position VARCHAR) RETURNS TABLE(
        campaign_id UUID,
        banner_url TEXT,
        target_url TEXT,
        advertiser_name VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT ac.id,
    ac.banner_url,
    ac.target_url,
    ac.advertiser_name
FROM public.ad_campaigns ac
WHERE ac.slot_position = p_slot_position
    AND ac.status = 'active'
    AND ac.is_approved = true
    AND CURRENT_DATE BETWEEN ac.start_date AND ac.end_date
ORDER BY RANDOM() -- Rotate ads randomly
LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTIONS: Track Impression
-- ============================================================================
CREATE OR REPLACE FUNCTION track_ad_impression(
        p_campaign_id UUID,
        p_viewer_ip VARCHAR,
        p_page_url TEXT
    ) RETURNS VOID AS $$ BEGIN -- Insert impression
INSERT INTO public.ad_impressions (
        campaign_id,
        viewer_ip,
        page_url
    )
VALUES (
        p_campaign_id,
        p_viewer_ip,
        p_page_url
    );
-- Update campaign stats
UPDATE public.ad_campaigns
SET total_impressions = total_impressions + 1,
    updated_at = NOW()
WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. FUNCTIONS: Track Click
-- ============================================================================
CREATE OR REPLACE FUNCTION track_ad_click(
        p_campaign_id UUID,
        p_clicker_ip VARCHAR,
        p_source_page TEXT
    ) RETURNS VOID AS $$ BEGIN -- Insert click
INSERT INTO public.ad_clicks (
        campaign_id,
        clicker_ip,
        source_page
    )
VALUES (
        p_campaign_id,
        p_clicker_ip,
        p_source_page
    );
-- Update campaign stats
UPDATE public.ad_campaigns
SET total_clicks = total_clicks + 1,
    updated_at = NOW()
WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. SEED DATA: Sample Campaign
-- ============================================================================
-- Note: Commented out as this will be created via admin panel
-- INSERT INTO public.ad_campaigns (
--   advertiser_id,
--   advertiser_name,
--   campaign_name,
--   banner_url,
--   target_url,
--   slot_position,
--   start_date,
--   end_date,
--   status,
--   is_approved
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'Toko Demo',
--   'Promo Akhir Tahun',
--   '/ads/promo-banner.jpg',
--   'https://tokodemo.com/promo',
--   'sidebar',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '30 days',
--   'active',
--   true
-- );
-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
-- Advertisers can view their own campaigns
CREATE POLICY "Advertisers can view their own campaigns" ON public.ad_campaigns FOR
SELECT USING (auth.uid() = advertiser_id);
-- Advertisers can create campaigns (pending approval)
CREATE POLICY "Advertisers can create campaigns" ON public.ad_campaigns FOR
INSERT WITH CHECK (
        auth.uid() = advertiser_id
        AND status = 'pending'
    );
-- Public can view active approved ads (for display)
CREATE POLICY "Public can view active ads" ON public.ad_campaigns FOR
SELECT USING (
        status = 'active'
        AND is_approved = true
    );
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Internal Ads System created successfully!';
RAISE NOTICE '📊 Tables: ad_campaigns, ad_impressions, ad_clicks';
RAISE NOTICE '🎯 Functions: get_active_ad_for_slot, track_impression, track_click';
RAISE NOTICE '💰 Monetization ready for seller promotions!';
END $$;