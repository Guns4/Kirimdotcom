-- =============================================================================
-- SEO LANDING PAGES - KECAMATAN DATABASE (FIXED & CLEAN)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. CITIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name VARCHAR(255) NOT NULL,
    city_slug VARCHAR(255) UNIQUE NOT NULL,
    province VARCHAR(100) NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    total_kecamatan INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(city_slug);
CREATE INDEX IF NOT EXISTS idx_cities_popular ON public.cities(is_popular);
-- =============================================================================
-- 2. KECAMATAN TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kecamatan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kecamatan_name VARCHAR(255) NOT NULL,
    kecamatan_slug VARCHAR(255) NOT NULL,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    postal_code VARCHAR(10),
    meta_title TEXT,
    meta_description TEXT,
    seo_content TEXT,
    avg_delivery_days INTEGER DEFAULT 3,
    available_couriers TEXT [] DEFAULT ARRAY ['JNE','J&T','SiCepat','AnterAja'],
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, kecamatan_slug)
);
CREATE INDEX IF NOT EXISTS idx_kecamatan_slug ON public.kecamatan(kecamatan_slug);
CREATE INDEX IF NOT EXISTS idx_kecamatan_city ON public.kecamatan(city_id);
-- =============================================================================
-- 3. SEO TEMPLATES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.seo_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    meta_title_template TEXT NOT NULL,
    meta_description_template TEXT NOT NULL,
    h1_template TEXT NOT NULL,
    intro_template TEXT NOT NULL,
    content_sections JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 4. SEED DATA - CITIES
-- =============================================================================
INSERT INTO public.cities (
        city_name,
        city_slug,
        province,
        is_popular,
        meta_title,
        meta_description
    )
VALUES (
        'Jakarta Selatan',
        'jakarta-selatan',
        'DKI Jakarta',
        true,
        'Cek Ongkir ke Jakarta Selatan',
        'Bandingkan ongkir ke Jakarta Selatan'
    ),
    (
        'Bandung',
        'bandung',
        'Jawa Barat',
        true,
        'Cek Ongkir ke Bandung',
        'Cari ongkir termurah ke Bandung'
    ) ON CONFLICT (city_slug) DO NOTHING;
-- =============================================================================
-- 5. SEED DATA - KECAMATAN (SAFE CTE)
-- =============================================================================
WITH city AS (
    SELECT id
    FROM public.cities
    WHERE city_slug = 'jakarta-selatan'
)
INSERT INTO public.kecamatan (
        kecamatan_name,
        kecamatan_slug,
        city_id,
        postal_code,
        avg_delivery_days
    )
SELECT 'Kebayoran Baru',
    'kebayoran-baru',
    city.id,
    '12110',
    1
FROM city ON CONFLICT (city_id, kecamatan_slug) DO NOTHING;
-- =============================================================================
-- 6. UPDATE STATS
-- =============================================================================
UPDATE public.cities c
SET total_kecamatan = (
        SELECT COUNT(*)
        FROM public.kecamatan k
        WHERE k.city_id = c.id
    );
-- =============================================================================
-- 7. RLS (PUBLIC READ)
-- =============================================================================
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kecamatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY cities_public_read ON public.cities FOR
SELECT USING (true);
CREATE POLICY kecamatan_public_read ON public.kecamatan FOR
SELECT USING (true);
-- =============================================================================
-- DONE
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ SEO Kecamatan database ready (NO city_slug error)';
RAISE NOTICE '🚀 Supabase-safe & production ready';
END $$;