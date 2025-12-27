-- =============================================================================
-- BOOKING RESI (AWB BOOKING) SYSTEM
-- Phase 476-480: Request Pick-up & Prepaid Shipping
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. SHIPPING RATES (Base prices from couriers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Courier
    courier VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    -- 'REG', 'YES', 'OKE', etc.
    -- Route
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    -- Pricing
    base_price DECIMAL(12, 2) NOT NULL,
    -- Original courier price
    weight_multiplier DECIMAL(5, 2) DEFAULT 1.0,
    -- Per kg multiplier
    -- ETD
    etd_min INTEGER DEFAULT 1,
    etd_max INTEGER DEFAULT 3,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rates_route ON public.shipping_rates(origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_rates_courier ON public.shipping_rates(courier);
-- =============================================================================
-- 2. SHIPPING BOOKINGS (AWB Requests)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL,
    -- Booking reference
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    -- JOB-xxxxxx
    -- Courier
    courier VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    -- Sender
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_city VARCHAR(100) NOT NULL,
    sender_postal_code VARCHAR(10),
    -- Recipient
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_city VARCHAR(100) NOT NULL,
    recipient_postal_code VARCHAR(10),
    -- Package
    package_weight INTEGER NOT NULL,
    -- in grams
    package_length INTEGER,
    -- cm
    package_width INTEGER,
    -- cm
    package_height INTEGER,
    -- cm
    package_description TEXT,
    -- Pricing
    base_price DECIMAL(12, 2) NOT NULL,
    -- Original price
    markup_percent DECIMAL(5, 2) DEFAULT 8.0,
    -- Our markup
    markup_amount DECIMAL(12, 2) NOT NULL,
    final_price DECIMAL(12, 2) NOT NULL,
    -- What user pays
    -- AWB
    awb_number VARCHAR(50),
    awb_generated_at TIMESTAMPTZ,
    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending -> confirmed -> pickup_scheduled -> picked_up -> completed
    -- Pickup
    pickup_date DATE,
    pickup_time_slot VARCHAR(50),
    pickup_notes TEXT,
    -- Payment
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    transaction_id UUID,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.shipping_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.shipping_bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.shipping_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_awb ON public.shipping_bookings(awb_number);
-- =============================================================================
-- 3. MARKUP SETTINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_markup_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Courier-specific or default
    courier VARCHAR(50),
    -- NULL = default for all
    -- Markup
    markup_percent DECIMAL(5, 2) NOT NULL DEFAULT 8.0,
    min_markup DECIMAL(10, 2) DEFAULT 1000,
    -- Minimum markup in IDR
    max_markup DECIMAL(10, 2) DEFAULT 50000,
    -- Maximum markup in IDR
    -- Promo
    promo_code VARCHAR(50),
    promo_discount_percent DECIMAL(5, 2) DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Default markup settings
INSERT INTO public.shipping_markup_settings (courier, markup_percent, min_markup)
VALUES (NULL, 8.0, 1000),
    -- Default 8%
    ('jne', 7.0, 1000),
    ('jnt', 8.0, 1000),
    ('sicepat', 8.0, 1000),
    ('anteraja', 10.0, 1500) ON CONFLICT DO NOTHING;
-- =============================================================================
-- 4. FUNCTION: Calculate Shipping Price with Markup
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_shipping_price(p_courier VARCHAR, p_base_price DECIMAL) RETURNS TABLE(
        base_price DECIMAL,
        markup_percent DECIMAL,
        markup_amount DECIMAL,
        final_price DECIMAL
    ) AS $$
DECLARE v_markup RECORD;
v_markup_amt DECIMAL;
BEGIN -- Get markup settings
SELECT * INTO v_markup
FROM public.shipping_markup_settings
WHERE (
        courier = p_courier
        OR courier IS NULL
    )
    AND is_active = true
ORDER BY courier NULLS LAST
LIMIT 1;
IF NOT FOUND THEN v_markup.markup_percent := 8.0;
v_markup.min_markup := 1000;
v_markup.max_markup := 50000;
END IF;
-- Calculate markup
v_markup_amt := p_base_price * (v_markup.markup_percent / 100);
-- Apply min/max
IF v_markup_amt < v_markup.min_markup THEN v_markup_amt := v_markup.min_markup;
ELSIF v_markup_amt > v_markup.max_markup THEN v_markup_amt := v_markup.max_markup;
END IF;
RETURN QUERY
SELECT p_base_price,
    v_markup.markup_percent,
    v_markup_amt,
    p_base_price + v_markup_amt;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. FUNCTION: Create Booking (with wallet deduction)
-- =============================================================================
CREATE OR REPLACE FUNCTION create_shipping_booking(
        p_user_id UUID,
        p_courier VARCHAR,
        p_service_type VARCHAR,
        p_sender JSONB,
        p_recipient JSONB,
        p_package JSONB,
        p_base_price DECIMAL,
        p_pickup_date DATE DEFAULT NULL
    ) RETURNS TABLE(
        success BOOLEAN,
        booking_id UUID,
        booking_code VARCHAR,
        final_price DECIMAL,
        message TEXT
    ) AS $$
DECLARE v_wallet RECORD;
v_price RECORD;
v_booking_id UUID;
v_booking_code VARCHAR;
BEGIN -- Calculate final price
SELECT * INTO v_price
FROM calculate_shipping_price(p_courier, p_base_price);
-- Check wallet balance
SELECT * INTO v_wallet
FROM public.wallets
WHERE user_id = p_user_id;
IF NOT FOUND
OR v_wallet.balance < v_price.final_price THEN RETURN QUERY
SELECT false,
    NULL::UUID,
    NULL::VARCHAR,
    v_price.final_price,
    'Saldo tidak cukup. Butuh: Rp ' || v_price.final_price::TEXT;
RETURN;
END IF;
-- Generate booking code
v_booking_code := 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
-- Create booking
INSERT INTO public.shipping_bookings (
        user_id,
        booking_code,
        courier,
        service_type,
        sender_name,
        sender_phone,
        sender_address,
        sender_city,
        recipient_name,
        recipient_phone,
        recipient_address,
        recipient_city,
        package_weight,
        package_description,
        base_price,
        markup_percent,
        markup_amount,
        final_price,
        pickup_date,
        is_paid,
        paid_at,
        status
    )
VALUES (
        p_user_id,
        v_booking_code,
        p_courier,
        p_service_type,
        p_sender->>'name',
        p_sender->>'phone',
        p_sender->>'address',
        p_sender->>'city',
        p_recipient->>'name',
        p_recipient->>'phone',
        p_recipient->>'address',
        p_recipient->>'city',
        (p_package->>'weight')::INTEGER,
        p_package->>'description',
        v_price.base_price,
        v_price.markup_percent,
        v_price.markup_amount,
        v_price.final_price,
        p_pickup_date,
        true,
        NOW(),
        'confirmed'
    )
RETURNING id INTO v_booking_id;
-- Deduct from wallet
UPDATE public.wallets
SET balance = balance - (v_price.final_price * 100)::INTEGER,
    updated_at = NOW()
WHERE user_id = p_user_id;
-- Log wallet transaction
INSERT INTO public.wallet_transactions (
        wallet_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        reference_id
    )
VALUES (
        v_wallet.id,
        'debit',
        (v_price.final_price * 100)::INTEGER,
        v_wallet.balance,
        v_wallet.balance - (v_price.final_price * 100)::INTEGER,
        'Booking resi ' || v_booking_code || ' - ' || p_courier,
        v_booking_code
    );
RETURN QUERY
SELECT true,
    v_booking_id,
    v_booking_code,
    v_price.final_price,
    'Booking berhasil! Kode: ' || v_booking_code;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================
ALTER TABLE public.shipping_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookings" ON public.shipping_bookings FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read shipping rates" ON public.shipping_rates FOR
SELECT USING (is_active = true);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Booking Resi System created!';
RAISE NOTICE '📦 AWB booking with prepaid';
RAISE NOTICE '💰 Ongkir markup 5-10%';
RAISE NOTICE '💳 Wallet deduction';
END $$;