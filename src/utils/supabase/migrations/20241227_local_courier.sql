-- =============================================================================
-- LOCAL COURIER SYSTEM
-- Phase 481-485: Community Logistics Network
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. LOCAL COURIERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.local_couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL UNIQUE,
    -- Profile
    courier_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    profile_photo TEXT,
    -- Location
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kelurahan VARCHAR(100),
    full_address TEXT,
    -- Coverage
    coverage_areas TEXT [],
    -- Array of kecamatan slugs they cover
    -- Pricing
    flat_rate DECIMAL(10, 2) NOT NULL,
    -- e.g., Rp 5,000 se-kecamatan
    extra_km_rate DECIMAL(10, 2) DEFAULT 0,
    -- Additional per km
    -- Vehicle
    vehicle_type VARCHAR(50),
    -- 'motor', 'mobil', 'sepeda', 'jalan_kaki'
    vehicle_plate VARCHAR(20),
    -- Availability
    is_online BOOLEAN DEFAULT false,
    last_online_at TIMESTAMPTZ,
    -- Operating hours
    operating_start TIME DEFAULT '08:00',
    operating_end TIME DEFAULT '21:00',
    operating_days INTEGER [] DEFAULT ARRAY [1,2,3,4,5,6,7],
    -- 1=Monday
    -- Stats
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(14, 2) DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    id_card_url TEXT,
    verified_at TIMESTAMPTZ,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_local_couriers_user ON public.local_couriers(user_id);
CREATE INDEX IF NOT EXISTS idx_local_couriers_kecamatan ON public.local_couriers(kecamatan);
CREATE INDEX IF NOT EXISTS idx_local_couriers_city ON public.local_couriers(city);
CREATE INDEX IF NOT EXISTS idx_local_couriers_online ON public.local_couriers(is_online, is_active);
CREATE INDEX IF NOT EXISTS idx_local_couriers_coverage ON public.local_couriers USING GIN(coverage_areas);
-- =============================================================================
-- 2. LOCAL DELIVERY ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.local_delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Parties
    customer_id UUID NOT NULL,
    courier_id UUID REFERENCES public.local_couriers(id),
    -- Order code
    order_code VARCHAR(50) UNIQUE NOT NULL,
    -- Pickup
    pickup_name VARCHAR(255) NOT NULL,
    pickup_phone VARCHAR(20) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_kecamatan VARCHAR(100) NOT NULL,
    pickup_notes TEXT,
    -- Delivery
    delivery_name VARCHAR(255) NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_kecamatan VARCHAR(100) NOT NULL,
    delivery_notes TEXT,
    -- Package
    package_description TEXT,
    package_weight VARCHAR(50),
    -- 'kecil', 'sedang', 'besar'
    is_fragile BOOLEAN DEFAULT false,
    -- Pricing
    delivery_fee DECIMAL(10, 2) NOT NULL,
    tip DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending -> accepted -> picking_up -> picked_up -> delivering -> delivered
    -- Timing
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    -- Payment
    payment_method VARCHAR(20) DEFAULT 'cash',
    -- 'cash', 'wallet'
    is_paid BOOLEAN DEFAULT false,
    -- Rating
    customer_rating INTEGER,
    customer_review TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_local_orders_customer ON public.local_delivery_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_local_orders_courier ON public.local_delivery_orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_local_orders_status ON public.local_delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_local_orders_kecamatan ON public.local_delivery_orders(pickup_kecamatan);
-- =============================================================================
-- 3. FUNCTION: Find Available Couriers
-- =============================================================================
CREATE OR REPLACE FUNCTION find_local_couriers(
        p_kecamatan VARCHAR,
        p_city VARCHAR DEFAULT NULL
    ) RETURNS TABLE(
        courier_id UUID,
        courier_name VARCHAR,
        phone VARCHAR,
        whatsapp VARCHAR,
        profile_photo TEXT,
        kecamatan VARCHAR,
        flat_rate DECIMAL,
        vehicle_type VARCHAR,
        avg_rating DECIMAL,
        total_deliveries INTEGER,
        is_online BOOLEAN
    ) AS $$ BEGIN RETURN QUERY
SELECT lc.id,
    lc.courier_name,
    lc.phone,
    lc.whatsapp,
    lc.profile_photo,
    lc.kecamatan,
    lc.flat_rate,
    lc.vehicle_type,
    lc.avg_rating,
    lc.total_deliveries,
    lc.is_online
FROM public.local_couriers lc
WHERE lc.is_active = true
    AND (
        LOWER(lc.kecamatan) = LOWER(p_kecamatan)
        OR p_kecamatan = ANY(lc.coverage_areas)
    )
    AND (
        p_city IS NULL
        OR LOWER(lc.city) = LOWER(p_city)
    )
ORDER BY lc.is_online DESC,
    lc.avg_rating DESC,
    lc.total_deliveries DESC;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 4. FUNCTION: Toggle Courier Online Status
-- =============================================================================
CREATE OR REPLACE FUNCTION toggle_courier_online(p_user_id UUID, p_is_online BOOLEAN) RETURNS BOOLEAN AS $$ BEGIN
UPDATE public.local_couriers
SET is_online = p_is_online,
    last_online_at = CASE
        WHEN p_is_online THEN NOW()
        ELSE last_online_at
    END,
    updated_at = NOW()
WHERE user_id = p_user_id;
RETURN true;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. FUNCTION: Update Courier Stats
-- =============================================================================
CREATE OR REPLACE FUNCTION update_courier_stats() RETURNS TRIGGER AS $$ BEGIN IF NEW.status = 'delivered'
    AND OLD.status != 'delivered' THEN
UPDATE public.local_couriers
SET total_deliveries = total_deliveries + 1,
    total_earnings = total_earnings + NEW.delivery_fee
WHERE id = NEW.courier_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_courier_stats
AFTER
UPDATE ON public.local_delivery_orders FOR EACH ROW EXECUTE FUNCTION update_courier_stats();
-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================
ALTER TABLE public.local_couriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active couriers" ON public.local_couriers FOR
SELECT USING (is_active = true);
CREATE POLICY "Users can manage own courier profile" ON public.local_couriers FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.local_delivery_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own orders" ON public.local_delivery_orders FOR
SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Couriers can view assigned orders" ON public.local_delivery_orders FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.local_couriers
            WHERE id = courier_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Customers can create orders" ON public.local_delivery_orders FOR
INSERT WITH CHECK (auth.uid() = customer_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Local Courier System created!';
RAISE NOTICE '🏍️ Courier registration ready';
RAISE NOTICE '📍 Kecamatan-based coverage';
RAISE NOTICE '🟢 Online/offline toggle';
RAISE NOTICE '📋 Public listing pages';
END $$;