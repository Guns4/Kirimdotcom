-- TABEL ZONA IKLAN (Ad placement positions)
CREATE TABLE IF NOT EXISTS public.ad_zones (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    required_width INT,
    required_height INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- SEED DATA ZONA (Strategic positions)
INSERT INTO public.ad_zones (
        code,
        name,
        description,
        required_width,
        required_height
    )
VALUES (
        'HOME_HERO',
        'Homepage Banner Utama',
        'Muncul di halaman depan paling atas',
        1200,
        400
    ),
    (
        'TRACKING_RESULT',
        'Cek Resi - Tengah',
        'Muncul di antara status pengiriman (High Traffic)',
        728,
        90
    ),
    (
        'MARKETPLACE_SIDEBAR',
        'Sidebar Toko',
        'Muncul di samping list produk',
        300,
        300
    ),
    (
        'MOBILE_STICKY',
        'Mobile Footer Sticky',
        'Melayang di bawah layar HP',
        320,
        50
    ) ON CONFLICT (code) DO NOTHING;
-- TABEL KAMPANYE IKLAN (Ad campaigns)
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_code VARCHAR(50) REFERENCES public.ad_zones(code),
    name VARCHAR(100),
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    views_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Policy Public Read (users can see ads)
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public View Ads" ON public.ad_campaigns;
CREATE POLICY "Public View Ads" ON public.ad_campaigns FOR
SELECT USING (is_active = true);
-- Database functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_ad_view(ad_id UUID) RETURNS void AS $$ BEGIN
UPDATE public.ad_campaigns
SET views_count = views_count + 1
WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION increment_ad_click(p_ad_id UUID) RETURNS void AS $$ BEGIN
UPDATE public.ad_campaigns
SET clicks_count = clicks_count + 1
WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql;
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_zone ON public.ad_campaigns(zone_code);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active ON public.ad_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);
COMMENT ON TABLE public.ad_zones IS 'Ad placement zones/positions on the website';
COMMENT ON TABLE public.ad_campaigns IS 'Ad campaigns with tracking for views and clicks';