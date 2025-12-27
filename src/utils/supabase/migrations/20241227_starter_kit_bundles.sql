-- ============================================================================
-- STARTER KIT BUNDLE DATABASE SCHEMA
-- Phase 306-310: Upselling System
-- ============================================================================
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================================================
-- 1. BUNDLE PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bundle_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_name VARCHAR(255) NOT NULL,
    bundle_slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    -- Pricing
    original_price DECIMAL(10, 2) NOT NULL,
    bundle_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
        ROUND(
            (
                (original_price - bundle_price) / original_price * 100
            )::numeric,
            2
        )
    ) STORED,
    -- Bundle contents (JSONB for flexibility)
    items JSONB NOT NULL,
    -- Example: [
    --   {"type": "ebook", "product_id": "uuid", "name": "Panduan Jualan"},
    --   {"type": "premium", "duration_days": 30},
    --   {"type": "template", "product_id": "uuid", "name": "Template Nota"}
    -- ]
    -- Marketing
    features TEXT [],
    -- Array of feature highlights
    badge_text VARCHAR(50),
    -- e.g., "BEST SELLER", "LIMITED TIME"
    -- Status
    is_active BOOLEAN DEFAULT true,
    stock_unlimited BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_bundle_slug ON public.bundle_products(bundle_slug);
CREATE INDEX IF NOT EXISTS idx_bundle_active ON public.bundle_products(is_active);
-- ============================================================================
-- 2. BUNDLE PURCHASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bundle_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES public.bundle_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Transaction details
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    -- payment_status: pending, completed, failed, refunded
    -- Fulfillment
    fulfilled BOOLEAN DEFAULT false,
    fulfilled_at TIMESTAMPTZ,
    fulfillment_data JSONB,
    -- Track what was delivered
    -- Metadata
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_user ON public.bundle_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_status ON public.bundle_purchases(payment_status);
-- ============================================================================
-- 3. TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Testimonial content
    customer_name VARCHAR(100) NOT NULL,
    customer_avatar_url TEXT,
    customer_role VARCHAR(100),
    -- e.g., "Online Seller", "UMKM Owner"
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT NOT NULL,
    -- Context
    related_product_type VARCHAR(50),
    -- e.g., "starter_kit", "ebook", "premium"
    related_product_id UUID,
    -- Display settings
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_product ON public.testimonials(related_product_type);
-- ============================================================================
-- 4. SEED DATA: Default Starter Kit Bundle
-- ============================================================================
INSERT INTO public.bundle_products (
        bundle_name,
        bundle_slug,
        description,
        original_price,
        bundle_price,
        items,
        features,
        badge_text,
        is_active
    )
VALUES (
        'Paket Siap Jualan - Pemula',
        'starter-kit-pemula',
        'Paket lengkap untuk memulai bisnis online Anda. Hemat 30% dibanding beli satuan!',
        300000.00,
        210000.00,
        '[
    {"type": "ebook", "name": "E-book: Panduan Lengkap Jualan Online", "value": 150000},
    {"type": "premium", "name": "Akses Premium 1 Bulan", "duration_days": 30, "value": 100000},
    {"type": "template", "name": "Template Nota & Invoice Profesional", "value": 50000}
  ]'::jsonb,
        ARRAY [
    'E-book Panduan Jualan Online (150 halaman)',
    'Akses PremiumSellerPro 1 Bulan',
    'Template Nota & Invoice Siap Pakai',
    'Akses Grup Komunitas Seller',
    'Update Gratis Selamanya'
  ],
        'BEST SELLER',
        true
    ) ON CONFLICT (bundle_slug) DO NOTHING;
-- ============================================================================
-- 5. SEED DATA: Dummy Testimonials
-- ============================================================================
INSERT INTO public.testimonials (
        customer_name,
        customer_role,
        rating,
        review_text,
        related_product_type,
        is_featured,
        display_order
    )
VALUES (
        'Budi Santoso',
        'Owner Toko Baju Online',
        5,
        'Paket starter kit ini luar biasa! Dalam 2 minggu pertama, omset saya langsung naik 3x lipat. E-booknya sangat detail dan mudah dipahami.',
        'starter_kit',
        true,
        1
    ),
    (
        'Siti Rahma',
        'Reseller Kosmetik',
        5,
        'Worth it banget! Harga paket jauh lebih murah daripada beli satuan. Template notanya juga profesional, customer jadi lebih percaya.',
        'starter_kit',
        true,
        2
    ),
    (
        'Ahmad Fauzi',
        'UMKM Makanan Ringan',
        4,
        'Sangat membantu untuk pemula seperti saya. Setelah ikuti panduan di e-book, sekarang sudah bisa kirim 50+ paket per hari!',
        'starter_kit',
        true,
        3
    ),
    (
        'Rina Wijaya',
        'Dropshipper Elektronik',
        5,
        'Investasi terbaik untuk bisnis online. Fitur premium-nya memudahkan tracking paket, dan customer service jadi lebih cepat.',
        'starter_kit',
        false,
        4
    ),
    (
        'Dedi Kurniawan',
        'Owner Fashion Store',
        5,
        'Awalnya ragu, tapi setelah coba ternyata beneran bagus. Templat notanya bikin toko saya terlihat lebih kredibel!',
        'starter_kit',
        false,
        5
    ) ON CONFLICT DO NOTHING;
-- ============================================================================
-- 6. FUNCTIONS: Calculate Bundle Savings
-- ============================================================================
CREATE OR REPLACE FUNCTION get_bundle_savings(bundle_uuid UUID) RETURNS DECIMAL(10, 2) AS $$
SELECT original_price - bundle_price
FROM public.bundle_products
WHERE id = bundle_uuid;
$$ LANGUAGE SQL STABLE;
-- ============================================================================
-- 7. RLS POLICIES (Row Level Security)
-- ============================================================================
-- Bundle products: Public read, admin write
ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bundle products are viewable by everyone" ON public.bundle_products FOR
SELECT USING (is_active = true);
-- Bundle purchases: Users can only see their own
ALTER TABLE public.bundle_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bundle purchases" ON public.bundle_purchases FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bundle purchases" ON public.bundle_purchases FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Testimonials: Public read
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR
SELECT USING (is_active = true);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Starter Kit database schema created successfully!';
RAISE NOTICE '📦 Tables: bundle_products, bundle_purchases, testimonials';
RAISE NOTICE '🎁 Default bundle: "Paket Siap Jualan - Pemula" (30%% discount)';
RAISE NOTICE '⭐ Testimonials: 5 dummy reviews seeded';
END $$;