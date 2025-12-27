-- =============================================================================
-- LOCAL ORDER & REVIEW SYSTEM
-- Phase 486-490: Simple Transaction via WhatsApp
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. COURIER REVIEWS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.courier_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    courier_id UUID NOT NULL REFERENCES public.local_couriers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.local_delivery_orders(id),
    reviewer_id UUID NOT NULL,
    -- Review
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    -- Aspects
    punctuality_rating INTEGER CHECK (
        punctuality_rating >= 1
        AND punctuality_rating <= 5
    ),
    friendliness_rating INTEGER CHECK (
        friendliness_rating >= 1
        AND friendliness_rating <= 5
    ),
    care_rating INTEGER CHECK (
        care_rating >= 1
        AND care_rating <= 5
    ),
    -- Status
    is_verified BOOLEAN DEFAULT false,
    -- Verified order
    is_visible BOOLEAN DEFAULT true,
    -- Response
    courier_response TEXT,
    responded_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id) -- One review per order
);
CREATE INDEX IF NOT EXISTS idx_reviews_courier ON public.courier_reviews(courier_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.courier_reviews(rating);
-- =============================================================================
-- 2. ORDER MESSAGES (WA Templates)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Type
    template_type VARCHAR(50) NOT NULL UNIQUE,
    -- 'order_request', 'order_confirm', 'order_complete'
    -- Template
    template_text TEXT NOT NULL,
    -- Status
    is_active BOOLEAN DEFAULT true
);
-- Seed templates
INSERT INTO public.order_message_templates (template_type, template_text)
VALUES (
        'order_request',
        'Halo {courier_name}! 👋

Saya mau kirim paket via CekKirim:

📦 *DETAIL PENGIRIMAN*
━━━━━━━━━━━━━━━━━━━━
📍 Jemput: {pickup_address}
📍 Antar: {delivery_address}
📦 Barang: {package_desc}
💰 Tarif: Rp {flat_rate}

Bisa dijemput sekarang? 🙏'
    ),
    (
        'order_confirm',
        '✅ ORDER DIKONFIRMASI

Kode: {order_code}
Kurir: {courier_name}
Status: Menunggu dijemput

Terima kasih! 🙏'
    ),
    (
        'order_complete',
        'Paket sudah diterima! 📦✅

Mohon berikan rating untuk kurir:
⭐⭐⭐⭐⭐

{review_link}'
    ) ON CONFLICT (template_type) DO NOTHING;
-- =============================================================================
-- 3. FUNCTION: Generate WA Order Message
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_order_wa_message(
        p_courier_id UUID,
        p_pickup_address TEXT,
        p_delivery_address TEXT,
        p_package_desc TEXT
    ) RETURNS TEXT AS $$
DECLARE v_courier RECORD;
v_template TEXT;
BEGIN -- Get courier
SELECT * INTO v_courier
FROM public.local_couriers
WHERE id = p_courier_id;
IF NOT FOUND THEN RETURN NULL;
END IF;
-- Get template
SELECT template_text INTO v_template
FROM public.order_message_templates
WHERE template_type = 'order_request'
    AND is_active = true;
IF NOT FOUND THEN v_template := 'Halo {courier_name}, saya mau kirim paket. Bisa?';
END IF;
-- Replace placeholders
v_template := REPLACE(
    v_template,
    '{courier_name}',
    v_courier.courier_name
);
v_template := REPLACE(v_template, '{pickup_address}', p_pickup_address);
v_template := REPLACE(
    v_template,
    '{delivery_address}',
    p_delivery_address
);
v_template := REPLACE(
    v_template,
    '{package_desc}',
    COALESCE(p_package_desc, 'Paket')
);
v_template := REPLACE(
    v_template,
    '{flat_rate}',
    v_courier.flat_rate::TEXT
);
RETURN v_template;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 4. FUNCTION: Submit Review & Update Rating
-- =============================================================================
CREATE OR REPLACE FUNCTION submit_courier_review(
        p_order_id UUID,
        p_reviewer_id UUID,
        p_rating INTEGER,
        p_review_text TEXT DEFAULT NULL,
        p_punctuality INTEGER DEFAULT NULL,
        p_friendliness INTEGER DEFAULT NULL,
        p_care INTEGER DEFAULT NULL
    ) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE v_order RECORD;
v_courier_id UUID;
v_avg_rating DECIMAL;
v_total_reviews INTEGER;
BEGIN -- Get order
SELECT * INTO v_order
FROM public.local_delivery_orders
WHERE id = p_order_id
    AND customer_id = p_reviewer_id;
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    'Order not found'::TEXT;
RETURN;
END IF;
IF v_order.status != 'delivered' THEN RETURN QUERY
SELECT false,
    'Order not yet delivered'::TEXT;
RETURN;
END IF;
v_courier_id := v_order.courier_id;
-- Insert review
INSERT INTO public.courier_reviews (
        courier_id,
        order_id,
        reviewer_id,
        rating,
        review_text,
        punctuality_rating,
        friendliness_rating,
        care_rating,
        is_verified
    )
VALUES (
        v_courier_id,
        p_order_id,
        p_reviewer_id,
        p_rating,
        p_review_text,
        p_punctuality,
        p_friendliness,
        p_care,
        true
    ) ON CONFLICT (order_id) DO
UPDATE
SET rating = p_rating,
    review_text = p_review_text;
-- Update order
UPDATE public.local_delivery_orders
SET customer_rating = p_rating,
    customer_review = p_review_text
WHERE id = p_order_id;
-- Calculate new average
SELECT COALESCE(AVG(rating), 0)::DECIMAL(3, 2),
    COUNT(*)::INTEGER INTO v_avg_rating,
    v_total_reviews
FROM public.courier_reviews
WHERE courier_id = v_courier_id
    AND is_visible = true;
-- Update courier stats
UPDATE public.local_couriers
SET avg_rating = v_avg_rating,
    total_reviews = v_total_reviews
WHERE id = v_courier_id;
RETURN QUERY
SELECT true,
    'Terima kasih atas reviewnya! ⭐'::TEXT;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. RLS POLICIES
-- =============================================================================
ALTER TABLE public.courier_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible reviews" ON public.courier_reviews FOR
SELECT USING (is_visible = true);
CREATE POLICY "Users can manage own reviews" ON public.courier_reviews FOR ALL USING (auth.uid() = reviewer_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Local Order & Review System created!';
RAISE NOTICE '📱 WA message generator ready';
RAISE NOTICE '⭐ Review system with aspects';
RAISE NOTICE '📊 Auto rating calculation';
END $$;