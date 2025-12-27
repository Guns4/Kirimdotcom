-- =============================================================================
-- CEKKIRIM - DATABASE SCHEMA (FRESH INSTALL)
-- Run this in Supabase SQL Editor
-- WARNING: This will DROP and recreate all tables!
-- =============================================================================
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- =============================================================================
-- DROP ALL EXISTING TABLES (Start Fresh)
-- =============================================================================
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.wa_templates CASCADE;
DROP TABLE IF EXISTS public.system_health_logs CASCADE;
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.faq_items CASCADE;
DROP TABLE IF EXISTS public.marketplace_fees CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.invoice_settings CASCADE;
DROP TABLE IF EXISTS public.api_usage_logs CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.dropship_orders CASCADE;
DROP TABLE IF EXISTS public.reseller_applications CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.supplier_categories CASCADE;
DROP TABLE IF EXISTS public.escrow_history CASCADE;
DROP TABLE IF EXISTS public.escrow_transactions CASCADE;
DROP TABLE IF EXISTS public.courier_reviews CASCADE;
DROP TABLE IF EXISTS public.local_delivery_orders CASCADE;
DROP TABLE IF EXISTS public.local_couriers CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.courier_markup CASCADE;
DROP TABLE IF EXISTS public.tracked_packages CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.rewards_catalog CASCADE;
DROP TABLE IF EXISTS public.points_history CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
-- =============================================================================
-- 1. USER PROFILES
-- =============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    user_role VARCHAR(20) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 2. WALLET SYSTEM
-- =============================================================================
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    pending_balance INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    transaction_type VARCHAR(30) NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER,
    balance_after INTEGER,
    description TEXT,
    reference_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 3. LOYALTY POINTS
-- =============================================================================
CREATE TABLE public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    total_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'bronze',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.points_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    points INTEGER NOT NULL,
    point_type VARCHAR(30) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.rewards_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    category VARCHAR(50),
    stock INTEGER DEFAULT -1,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 4. ORDERS & TRACKING
-- =============================================================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    marketplace VARCHAR(50),
    order_status VARCHAR(30) DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_province VARCHAR(100),
    customer_postal VARCHAR(10),
    courier VARCHAR(50),
    courier_service VARCHAR(50),
    awb_number VARCHAR(100),
    shipping_cost DECIMAL(12, 2),
    total_amount DECIMAL(12, 2),
    items_count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.tracked_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    awb_number VARCHAR(100) NOT NULL,
    courier VARCHAR(50) NOT NULL,
    origin_city VARCHAR(255),
    destination_city VARCHAR(255),
    package_status VARCHAR(50),
    last_status_update TIMESTAMPTZ,
    last_location VARCHAR(255),
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 5. BOOKING RESI
-- =============================================================================
CREATE TABLE public.courier_markup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_code VARCHAR(20) NOT NULL UNIQUE,
    courier_name VARCHAR(100) NOT NULL,
    markup_percentage DECIMAL(5, 2) DEFAULT 8,
    min_markup INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.courier_markup (
        courier_code,
        courier_name,
        markup_percentage,
        min_markup
    )
VALUES ('jne', 'JNE Express', 7, 1000),
    ('jnt', 'J&T Express', 8, 1000),
    ('sicepat', 'SiCepat', 8, 1000),
    ('anteraja', 'AnterAja', 10, 1500),
    ('ninja', 'Ninja Xpress', 8, 1000),
    ('pos', 'POS Indonesia', 5, 500);
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_city VARCHAR(100) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_city VARCHAR(100) NOT NULL,
    weight_grams INTEGER NOT NULL,
    package_description TEXT,
    courier VARCHAR(50) NOT NULL,
    courier_service VARCHAR(50) NOT NULL,
    base_cost DECIMAL(12, 2) NOT NULL,
    markup_amount DECIMAL(12, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    awb_number VARCHAR(100),
    awb_generated_at TIMESTAMPTZ,
    booking_status VARCHAR(30) DEFAULT 'pending',
    pickup_date DATE,
    pickup_time_slot VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 6. LOCAL COURIER
-- =============================================================================
CREATE TABLE public.local_couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    courier_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    profile_photo TEXT,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kelurahan VARCHAR(100),
    full_address TEXT,
    coverage_areas TEXT [],
    flat_rate DECIMAL(10, 2) NOT NULL,
    extra_km_rate DECIMAL(10, 2) DEFAULT 0,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    is_online BOOLEAN DEFAULT false,
    last_online_at TIMESTAMPTZ,
    operating_start TIME DEFAULT '08:00',
    operating_end TIME DEFAULT '21:00',
    operating_days INTEGER [] DEFAULT ARRAY [1,2,3,4,5,6,7],
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(14, 2) DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.local_delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    courier_id UUID REFERENCES public.local_couriers(id),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    pickup_name VARCHAR(255) NOT NULL,
    pickup_phone VARCHAR(20) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_kecamatan VARCHAR(100) NOT NULL,
    pickup_notes TEXT,
    delivery_name VARCHAR(255) NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_kecamatan VARCHAR(100) NOT NULL,
    delivery_notes TEXT,
    package_description TEXT,
    package_weight VARCHAR(50),
    is_fragile BOOLEAN DEFAULT false,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(30) DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    payment_method VARCHAR(20) DEFAULT 'cash',
    is_paid BOOLEAN DEFAULT false,
    customer_rating INTEGER,
    customer_review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.courier_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_id UUID NOT NULL REFERENCES public.local_couriers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.local_delivery_orders(id),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);
-- =============================================================================
-- 7. ESCROW (REKBER)
-- =============================================================================
CREATE TABLE public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID REFERENCES auth.users(id),
    courier_id UUID REFERENCES public.local_couriers(id),
    local_order_id UUID REFERENCES public.local_delivery_orders(id),
    product_amount DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) NOT NULL,
    admin_fee DECIMAL(12, 2) DEFAULT 1000,
    total_amount DECIMAL(12, 2) NOT NULL,
    release_code VARCHAR(6) NOT NULL,
    release_code_hash TEXT NOT NULL,
    escrow_status VARCHAR(30) DEFAULT 'pending',
    seller_payout DECIMAL(12, 2),
    courier_payout DECIMAL(12, 2),
    funded_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.escrow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    actor_id UUID REFERENCES auth.users(id),
    actor_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 8. SUPPLIERS
-- =============================================================================
CREATE TABLE public.supplier_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);
INSERT INTO public.supplier_categories (name, slug, icon, sort_order)
VALUES ('Fashion', 'fashion', '👗', 1),
    ('Elektronik', 'elektronik', '📱', 2),
    ('Makanan & Minuman', 'fnb', '🍕', 3),
    ('Kecantikan', 'beauty', '💄', 4),
    ('Rumah Tangga', 'home', '🏠', 5),
    ('Kesehatan', 'health', '💊', 6);
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    category_id UUID REFERENCES public.supplier_categories(id),
    city VARCHAR(100),
    province VARCHAR(100),
    full_address TEXT,
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    min_order DECIMAL(12, 2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_resellers INTEGER DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.reseller_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    message TEXT,
    application_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    UNIQUE(supplier_id, user_id)
);
-- =============================================================================
-- 9. DROPSHIP
-- =============================================================================
CREATE TABLE public.dropship_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID NOT NULL REFERENCES auth.users(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(100),
    custom_sender_name VARCHAR(255),
    items JSONB NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    order_status VARCHAR(30) DEFAULT 'pending',
    awb_number VARCHAR(100),
    courier VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 10. API KEYS
-- =============================================================================
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    key_hash TEXT NOT NULL,
    plan_type VARCHAR(20) DEFAULT 'free',
    rate_limit INTEGER DEFAULT 100,
    total_requests INTEGER DEFAULT 0,
    monthly_requests INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES public.api_keys(id),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 11. INVOICES
-- =============================================================================
CREATE TABLE public.invoice_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    business_name VARCHAR(255),
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    logo_url TEXT,
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    bank_holder VARCHAR(100),
    footer_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(14, 2) NOT NULL,
    tax_amount DECIMAL(14, 2) DEFAULT 0,
    discount_amount DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) NOT NULL,
    invoice_status VARCHAR(20) DEFAULT 'draft',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 12. PRODUCTS
-- =============================================================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_price DECIMAL(14, 2) NOT NULL,
    selling_price DECIMAL(14, 2) NOT NULL,
    category VARCHAR(100),
    weight_grams INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.marketplace_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    marketplace VARCHAR(50) NOT NULL,
    fee_percentage DECIMAL(5, 2) NOT NULL,
    fee_fixed DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, marketplace)
);
-- =============================================================================
-- 13. FAQ & SUPPORT
-- =============================================================================
CREATE TABLE public.faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keywords TEXT [] NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(100),
    category VARCHAR(50),
    priority INTEGER DEFAULT 0,
    times_shown INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.faq_items (
        keywords,
        question,
        answer,
        link_url,
        category,
        priority
    )
VALUES (
        ARRAY ['cek', 'resi', 'lacak', 'tracking'],
        'Bagaimana cara cek resi?',
        'Masukkan nomor resi di halaman utama lalu klik Lacak.',
        '/',
        'tracking',
        10
    ),
    (
        ARRAY ['ongkir', 'ongkos', 'kirim', 'biaya'],
        'Bagaimana cara cek ongkir?',
        'Kunjungi halaman Cek Ongkir, masukkan kota asal dan tujuan.',
        '/cek-ongkir',
        'shipping',
        10
    ),
    (
        ARRAY ['daftar', 'register', 'akun'],
        'Bagaimana cara daftar?',
        'Klik Daftar di pojok kanan atas, masukkan email dan password.',
        '/auth/register',
        'account',
        8
    ),
    (
        ARRAY ['wallet', 'saldo', 'deposit'],
        'Bagaimana cara isi saldo?',
        'Masuk ke Dashboard > Wallet > Isi Saldo.',
        '/dashboard/wallet',
        'payment',
        8
    );
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    ticket_status VARCHAR(20) DEFAULT 'open',
    auto_reply_sent BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 14. SYSTEM & SECURITY
-- =============================================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255),
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    UNIQUE(identifier, endpoint)
);
CREATE TABLE public.system_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_type VARCHAR(50) NOT NULL,
    target_url TEXT,
    target_name VARCHAR(100),
    is_healthy BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    alert_sent BOOLEAN DEFAULT false,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 15. NOTIFICATIONS
-- =============================================================================
CREATE TABLE public.wa_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    template_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100),
    template_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    template_type VARCHAR(50),
    message_content TEXT,
    notification_status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 16. ENABLE RLS
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropship_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
-- =============================================================================
-- 17. CREATE RLS POLICIES
-- =============================================================================
-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
-- Wallets
CREATE POLICY "wallets_select" ON public.wallets FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_select" ON public.wallet_transactions FOR
SELECT USING (true);
-- Orders
CREATE POLICY "orders_all" ON public.orders FOR ALL USING (auth.uid() = user_id);
-- Tracked Packages
CREATE POLICY "packages_all" ON public.tracked_packages FOR ALL USING (auth.uid() = user_id);
-- Bookings
CREATE POLICY "bookings_all" ON public.bookings FOR ALL USING (auth.uid() = user_id);
-- Local Couriers
CREATE POLICY "couriers_select" ON public.local_couriers FOR
SELECT USING (is_active = true);
CREATE POLICY "couriers_manage" ON public.local_couriers FOR ALL USING (auth.uid() = user_id);
-- Escrow
CREATE POLICY "escrow_select" ON public.escrow_transactions FOR
SELECT USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
    );
-- Suppliers
CREATE POLICY "suppliers_select" ON public.suppliers FOR
SELECT USING (is_active = true);
CREATE POLICY "suppliers_manage" ON public.suppliers FOR ALL USING (auth.uid() = user_id);
-- Products
CREATE POLICY "products_all" ON public.products FOR ALL USING (auth.uid() = user_id);
-- Invoices
CREATE POLICY "invoices_all" ON public.invoices FOR ALL USING (auth.uid() = user_id);
-- API Keys
CREATE POLICY "apikeys_all" ON public.api_keys FOR ALL USING (auth.uid() = user_id);
-- Support
CREATE POLICY "tickets_select" ON public.support_tickets FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert" ON public.support_tickets FOR
INSERT WITH CHECK (true);
-- =============================================================================
-- DONE!
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ CekKirim Database Schema Complete!';
END $$;