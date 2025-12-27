-- =============================================================================
-- SUPPLIER DIRECTORY SYSTEM
-- Phase 466-470: B2B Matchmaking for Resellers
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. SUPPLIERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL UNIQUE,
    -- Business info
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    business_logo TEXT,
    -- URL
    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20) NOT NULL,
    contact_whatsapp VARCHAR(20),
    contact_email VARCHAR(255),
    -- Location
    province VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    warehouse_address TEXT,
    -- Categories
    categories TEXT [],
    -- ['fashion', 'electronics', 'beauty']
    -- Reseller info
    min_order_qty INTEGER DEFAULT 1,
    min_order_value DECIMAL(12, 2) DEFAULT 0,
    reseller_requirements TEXT,
    reseller_benefits TEXT [],
    -- Catalog
    catalog_pdf_url TEXT,
    price_list_url TEXT,
    product_images TEXT [],
    -- Array of URLs
    -- Stats
    total_resellers INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    -- Rating
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON public.suppliers(city);
CREATE INDEX IF NOT EXISTS idx_suppliers_categories ON public.suppliers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_featured ON public.suppliers(is_featured);
-- =============================================================================
-- 2. SUPPLIER PRODUCTS (Showcase)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reference
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    -- Product info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    -- Pricing
    retail_price DECIMAL(12, 2),
    reseller_price DECIMAL(12, 2),
    min_qty INTEGER DEFAULT 1,
    -- Category
    category VARCHAR(100),
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplier_products ON public.supplier_products(supplier_id);
-- =============================================================================
-- 3. RESELLER APPLICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reseller_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Applicant info
    applicant_name VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_email VARCHAR(255),
    applicant_city VARCHAR(100),
    -- Business info
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    -- 'dropshipper', 'reseller', 'agen'
    marketplace_links TEXT [],
    -- Links to their store
    -- Message
    message TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reseller_apps_supplier ON public.reseller_applications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reseller_apps_user ON public.reseller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_reseller_apps_status ON public.reseller_applications(status);
-- =============================================================================
-- 4. SUPPLIER REVIEWS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.supplier_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Review
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    -- Status
    is_verified_purchase BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supplier_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_supplier ON public.supplier_reviews(supplier_id);
-- =============================================================================
-- 5. CATEGORY PRESETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.supplier_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Category
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);
INSERT INTO public.supplier_categories (slug, name, icon, display_order)
VALUES ('fashion', 'Fashion & Pakaian', 'shirt', 1),
    ('beauty', 'Kecantikan & Skincare', 'sparkles', 2),
    (
        'electronics',
        'Elektronik & Gadget',
        'smartphone',
        3
    ),
    ('fnb', 'Makanan & Minuman', 'utensils', 4),
    ('home', 'Rumah Tangga', 'home', 5),
    ('baby', 'Ibu & Bayi', 'baby', 6),
    ('health', 'Kesehatan', 'heart-pulse', 7),
    ('sports', 'Olahraga', 'dumbbell', 8),
    ('automotive', 'Otomotif', 'car', 9),
    ('hobbies', 'Hobi & Mainan', 'gamepad-2', 10) ON CONFLICT (slug) DO NOTHING;
-- =============================================================================
-- 6. FUNCTION: Search Suppliers
-- =============================================================================
CREATE OR REPLACE FUNCTION search_suppliers(
        p_category VARCHAR DEFAULT NULL,
        p_city VARCHAR DEFAULT NULL,
        p_province VARCHAR DEFAULT NULL,
        p_search VARCHAR DEFAULT NULL,
        p_verified_only BOOLEAN DEFAULT false,
        p_limit INTEGER DEFAULT 20,
        p_offset INTEGER DEFAULT 0
    ) RETURNS TABLE(
        supplier_id UUID,
        business_name VARCHAR,
        business_description TEXT,
        business_logo TEXT,
        city VARCHAR,
        province VARCHAR,
        categories TEXT [],
        contact_whatsapp VARCHAR,
        min_order_qty INTEGER,
        avg_rating DECIMAL,
        total_reviews INTEGER,
        is_verified BOOLEAN,
        is_featured BOOLEAN
    ) AS $$ BEGIN RETURN QUERY
SELECT s.id,
    s.business_name,
    s.business_description,
    s.business_logo,
    s.city,
    s.province,
    s.categories,
    s.contact_whatsapp,
    s.min_order_qty,
    s.avg_rating,
    s.total_reviews,
    s.is_verified,
    s.is_featured
FROM public.suppliers s
WHERE s.is_active = true
    AND (
        p_category IS NULL
        OR p_category = ANY(s.categories)
    )
    AND (
        p_city IS NULL
        OR LOWER(s.city) = LOWER(p_city)
    )
    AND (
        p_province IS NULL
        OR LOWER(s.province) = LOWER(p_province)
    )
    AND (
        p_verified_only = false
        OR s.is_verified = true
    )
    AND (
        p_search IS NULL
        OR s.business_name ILIKE '%' || p_search || '%'
        OR s.business_description ILIKE '%' || p_search || '%'
    )
ORDER BY s.is_featured DESC,
    s.is_verified DESC,
    s.avg_rating DESC,
    s.total_views DESC
LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. FUNCTION: Update View Count
-- =============================================================================
CREATE OR REPLACE FUNCTION increment_supplier_views(p_supplier_id UUID) RETURNS VOID AS $$ BEGIN
UPDATE public.suppliers
SET total_views = total_views + 1
WHERE id = p_supplier_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 8. RLS POLICIES
-- =============================================================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active suppliers" ON public.suppliers FOR
SELECT USING (is_active = true);
CREATE POLICY "Users can manage own supplier" ON public.suppliers FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read supplier products" ON public.supplier_products FOR
SELECT USING (is_active = true);
ALTER TABLE public.reseller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers can view applications" ON public.reseller_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.suppliers
            WHERE id = supplier_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can apply" ON public.reseller_applications FOR
INSERT WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.supplier_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.supplier_categories FOR
SELECT USING (true);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Supplier Directory System created!';
RAISE NOTICE '🏪 Supplier profiles ready';
RAISE NOTICE '🔍 Search by category/location';
RAISE NOTICE '📋 Reseller applications';
RAISE NOTICE '⭐ Reviews & ratings';
END $$;