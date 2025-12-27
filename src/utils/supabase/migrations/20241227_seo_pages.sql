-- ============================================================================
-- SEO LANDING PAGES - KECAMATAN DATABASE
-- Phase 331-335: Local SEO Domination
-- ============================================================================
-- ============================================================================
-- 1. CITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- City details
    city_name VARCHAR(255) NOT NULL,
    city_slug VARCHAR(255) UNIQUE NOT NULL,
    province VARCHAR(100) NOT NULL,
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    -- Stats (for popular cities)
    total_kecamatan INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(city_slug);
CREATE INDEX IF NOT EXISTS idx_cities_popular ON public.cities(is_popular);
-- ============================================================================
-- 2. KECAMATAN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kecamatan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Kecamatan details
    kecamatan_name VARCHAR(255) NOT NULL,
    kecamatan_slug VARCHAR(255) NOT NULL,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    -- Location
    postal_code VARCHAR(10),
    -- SEO content
    meta_title TEXT,
    meta_description TEXT,
    seo_content TEXT,
    -- Auto-generated article
    -- Shipping info (estimated from city)
    avg_delivery_days INTEGER DEFAULT 3,
    available_couriers TEXT [] DEFAULT ARRAY ['JNE', 'J&T', 'SiCepat', 'AnterAja'],
    -- Stats
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, kecamatan_slug)
);
CREATE INDEX IF NOT EXISTS idx_kecamatan_slug ON public.kecamatan(kecamatan_slug);
CREATE INDEX IF NOT EXISTS idx_kecamatan_city ON public.kecamatan(city_id);
CREATE INDEX IF NOT EXISTS idx_kecamatan_search ON public.kecamatan(search_count DESC);
-- ============================================================================
-- 3. SEO TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Template details
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    -- 'kecamatan', 'city', 'province'
    -- Content templates
    meta_title_template TEXT NOT NULL,
    meta_description_template TEXT NOT NULL,
    h1_template TEXT NOT NULL,
    intro_template TEXT NOT NULL,
    content_sections JSONB,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================================================
-- 4. SEED DATA: Popular Cities & Kecamatan
-- ============================================================================
-- Insert popular cities
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
        'Cek Ongkir ke Jakarta Selatan - Murah & Cepat',
        'Bandingkan biaya kirim ke Jakarta Selatan dari JNE, J&T, SiCepat, AnterAja. Estimasi 1-2 hari.'
    ),
    (
        'Bandung',
        'bandung',
        'Jawa Barat',
        true,
        'Cek Ongkir ke Bandung - Ekspedisi Termurah',
        'Cari tarif ongkir termurah ke Bandung. Dukungan semua kurir: JNE, J&T, SiCepat, Ninja, dll.'
    ),
    (
        'Surabaya',
        'surabaya',
        'Jawa Timur',
        true,
        'Cek Ongkir ke Surabaya - Compare Harga',
        'Bandingkan ongkir ke Surabaya dari berbagai ekspedisi. Gratis cek tarif!'
    ),
    (
        'Medan',
        'medan',
        'Sumatera Utara',
        true,
        'Cek Ongkir ke Medan - Cepat & Akurat',
        'Hitung biaya kirim ke Medan dengan akurat. Tersedia tracking real-time.'
    ),
    (
        'Semarang',
        'semarang',
        'Jawa Tengah',
        true,
        'Cek Ongkir ke Semarang - Hemat Ongkir',
        'Temukan ekspedisi termurah ke Semarang. Compare harga dari 10+ kurir.'
    ) ON CONFLICT (city_slug) DO NOTHING;
-- Insert kecamatan for Jakarta Selatan
INSERT INTO public.kecamatan (
        kecamatan_name,
        kecamatan_slug,
        city_id,
        postal_code,
        avg_delivery_days
    )
VALUES (
        'Kebayoran Baru',
        'kebayoran-baru',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'jakarta-selatan'
        ),
        '12110',
        1
    ),
    (
        'Tebet',
        'tebet',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'jakarta-selatan'
        ),
        '12810',
        1
    ),
    (
        'Jagakarsa',
        'jagakarsa',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'jakarta-selatan'
        ),
        '12610',
        1
    ),
    (
        'Cilandak',
        'cilandak',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'jakarta-selatan'
        ),
        '12430',
        1
    ),
    (
        'Pasar Minggu',
        'pasar-minggu',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'jakarta-selatan'
        ),
        '12510',
        1
    ) ON CONFLICT (city_id, kecamatan_slug) DO NOTHING;
-- Insert kecamatan for Bandung
INSERT INTO public.kecamatan (
        kecamatan_name,
        kecamatan_slug,
        city_id,
        avg_delivery_days
    )
VALUES (
        'Bandung Wetan',
        'bandung-wetan',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'bandung'
        ),
        2
    ),
    (
        'Coblong',
        'coblong',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'bandung'
        ),
        2
    ),
    (
        'Sucinarasa',
        'sucinarasa',
        (
            SELECT id
            FROM public.cities
            WHERE city_slug = 'bandung'
        ),
        2
    ) ON CONFLICT (city_id, kecamatan_slug) DO NOTHING;
-- Update city kecamatan counts
UPDATE public.cities c
SET total_kecamatan = (
        SELECT COUNT(*)
        FROM public.kecamatan k
        WHERE k.city_id = c.id
    );
-- ============================================================================
-- 5. SEO TEMPLATE
-- ============================================================================
INSERT INTO public.seo_templates (
        template_name,
        template_type,
        meta_title_template,
        meta_description_template,
        h1_template,
        intro_template,
        content_sections
    )
VALUES (
        'Kecamatan Default',
        'kecamatan',
        'Cek Ongkir ke {kecamatan}, {city} - Bandingkan {courier_count}+ Ekspedisi',
        'Cari tarif ongkir termurah ke {kecamatan}, {city}. Tersedia {couriers}. Estimasi sampai {days} hari. Gratis tracking real-time!',
        'Cek Ongkir ke {kecamatan}, {city}',
        'Mau kirim paket ke **{kecamatan}, {city}**? Bandingkan tarif ongkir dari berbagai ekspedisi di sini! Kami menyediakan perbandingan harga dari {couriers} dan ekspedisi lainnya.',
        '{
    "sections": [
      {
        "title": "Ekspedisi yang Melayani {kecamatan}",
        "content": "Berikut adalah daftar ekspedisi yang melayani pengiriman ke {kecamatan}: {couriers}. Semua kurir tersebut memiliki track record pengiriman yang baik ke area ini."
      },
      {
        "title": "Estimasi Waktu Pengiriman",
        "content": "Rata-rata waktu pengiriman ke {kecamatan}, {city} adalah {days} hari kerja. Namun, waktu sebenarnya bisa bervariasi tergantung layanan yang dipilih (reguler/express) dan lokasi asal pengiriman."
      },
      {
        "title": "Tips Hemat Ongkir ke {kecamatan}",
        "content": "1. Bandingkan harga dari berbagai ekspedisi. 2. Pilih layanan reguler jika tidak terburu-buru. 3. Manfaatkan promo gratis ongkir. 4. Kirim dalam jumlah banyak untuk potongan harga volume."
      }
    ]
  }'::jsonb
    );
-- ============================================================================
-- 6. FUNCTIONS: Auto-generate SEO content
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_seo_content(p_kecamatan_id UUID) RETURNS TEXT AS $$
DECLARE v_kecamatan RECORD;
v_city RECORD;
v_template RECORD;
v_content TEXT;
v_couriers TEXT;
v_courier_count INTEGER;
BEGIN -- Get kecamatan data
SELECT * INTO v_kecamatan
FROM public.kecamatan
WHERE id = p_kecamatan_id;
SELECT * INTO v_city
FROM public.cities
WHERE id = v_kecamatan.city_id;
IF NOT FOUND THEN RETURN NULL;
END IF;
-- Get template
SELECT * INTO v_template
FROM public.seo_templates
WHERE template_type = 'kecamatan'
    AND is_active = true
LIMIT 1;
-- Build couriers string
v_courier_count := array_length(v_kecamatan.available_couriers, 1);
v_couriers := array_to_string(v_kecamatan.available_couriers, ', ');
-- Generate content
v_content := v_template.intro_template;
v_content := replace(
    v_content,
    '{kecamatan}',
    v_kecamatan.kecamatan_name
);
v_content := replace(v_content, '{city}', v_city.city_name);
v_content := replace(v_content, '{couriers}', v_couriers);
v_content := replace(
    v_content,
    '{courier_count}',
    v_courier_count::TEXT
);
v_content := replace(
    v_content,
    '{days}',
    v_kecamatan.avg_delivery_days::TEXT
);
RETURN v_content;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. RLS POLICIES (Public read)
-- ============================================================================
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kecamatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR
SELECT USING (true);
CREATE POLICY "Kecamatan are viewable by everyone" ON public.kecamatan FOR
SELECT USING (true);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ SEO Pages database created successfully!';
RAISE NOTICE '🏙️ Cities seeded: Jakarta Selatan, Bandung, Surabaya, Medan, Semarang';
RAISE NOTICE '📍 Sample kecamatan data inserted';
RAISE NOTICE '📝 SEO content templates ready';
RAISE NOTICE '🔍 Ready for /cek-ongkir/[city]/[kecamatan] routes!';
END $$;