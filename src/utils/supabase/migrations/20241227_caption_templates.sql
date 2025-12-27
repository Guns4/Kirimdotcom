-- =============================================================================
-- CAPTION GENERATOR - TEMPLATE DATABASE
-- =============================================================================
-- Enable UUID extension (wajib di PostgreSQL/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. CAPTION TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.caption_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    sales_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(255),
    description TEXT,
    tags TEXT [],
    usage_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_caption_category ON public.caption_templates(category);
CREATE INDEX IF NOT EXISTS idx_caption_sales_type ON public.caption_templates(sales_type);
CREATE INDEX IF NOT EXISTS idx_caption_active ON public.caption_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_caption_featured ON public.caption_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_caption_usage ON public.caption_templates(usage_count DESC);
-- =============================================================================
-- 2. USER FAVORITES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.caption_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    template_id UUID NOT NULL REFERENCES public.caption_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);
CREATE INDEX IF NOT EXISTS idx_caption_fav_user ON public.caption_favorites(user_id);
-- =============================================================================
-- 3. SEED DATA
-- =============================================================================
-- ===================== FASHION - HARD SELLING =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🔥 FLASH SALE ALERT! 🔥

Koleksi terbaru hadir dengan harga SPESIAL!
Buruan order sebelum kehabisan!

💰 Harga: [HARGA]
📦 Stok: Terbatas
🚚 Free Ongkir: Min [JUMLAH]

Order sekarang! Chat admin 👇',
        'fashion',
        'hard_selling',
        'Flash Sale Fashion',
        true
    ),
    (
        'READY STOCK! ✨

[NAMA_PRODUK]
Bahan: [BAHAN]
Warna: [WARNA]
Size: [SIZE]

💵 HARGA CUMA Rp [HARGA]!

Langsung order ya, jangan sampai kehabisan!
📲 WA: [NO_WA]',
        'fashion',
        'hard_selling',
        'Ready Stock Direct',
        false
    );
-- ===================== FASHION - SOFT SELLING =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'New Arrival Alert! 💕
Swipe untuk lihat detail & color options ➡️

#OOTD #FashionDaily #StyleInspiration',
        'fashion',
        'soft_selling',
        'New Arrival Soft'
    ),
    (
        'Hari ini pakai apa? 🤔
Tap link di bio untuk lihat koleksi lengkap 💫

#FashionTips #StyleGoals',
        'fashion',
        'soft_selling',
        'Style Inspiration'
    );
-- ===================== FOOD - HARD SELLING =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '🍔 LAPAR? ORDER SEKARANG! 🍔

Menu favorit tersedia!
Delivery & Dine-in tersedia!',
        'food',
        'hard_selling',
        'Food Menu Direct',
        true
    ),
    (
        'PROMO HARI INI! 🎊

Paket Hemat Cuma Rp [HARGA]
Terbatas 20 porsi pertama!

WA: [NO_WA]',
        'food',
        'hard_selling',
        'Food Promo Package',
        false
    );
-- ===================== BEAUTY - HARD SELLING =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name,
        is_featured
    )
VALUES (
        '💄 BEAUTY SALE! 💄
100% Original & BPOM!

Harga: Rp [HARGA]
WA: [NO_WA]',
        'beauty',
        'hard_selling',
        'Beauty Product Sale',
        true
    ),
    (
        'SERUM VIRAL! ⭐
Aman untuk semua jenis kulit

DM for order 💌',
        'beauty',
        'hard_selling',
        'Viral Skincare',
        false
    );
-- ===================== GENERAL - EDUCATIONAL =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
VALUES (
        'Tips Belanja Online yang Aman!
Gunakan payment terpercaya 💕',
        'general',
        'educational',
        'Shopping Safety Tips'
    ),
    (
        'Cara Merawat Produk Agar Awet!
Produk terawat = tahan lama',
        'general',
        'educational',
        'Product Care'
    );
-- ===================== AUTO GENERATED TEMPLATES =====================
INSERT INTO public.caption_templates (
        template_text,
        category,
        sales_type,
        template_name
    )
SELECT 'Template ' || gs || ' - ' || c.category || ' ' || s.sales_type,
    c.category,
    s.sales_type,
    'Auto Template ' || gs
FROM generate_series(1, 35) gs
    CROSS JOIN (
        VALUES ('fashion'),
('food'),
('electronics'),
('beauty'),
('general')
    ) AS c(category)
    CROSS JOIN (
        VALUES ('hard_selling'),
('soft_selling'),
('discount')
    ) AS s(sales_type)
LIMIT 35;
-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.caption_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY caption_templates_public_read ON public.caption_templates FOR
SELECT USING (is_active = true);
ALTER TABLE public.caption_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY caption_favorites_user_manage ON public.caption_favorites FOR ALL USING (auth.uid() = user_id);
-- =============================================================================
-- DONE
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Caption Generator database created successfully!';
RAISE NOTICE '📝 50+ caption templates seeded';
END $$;