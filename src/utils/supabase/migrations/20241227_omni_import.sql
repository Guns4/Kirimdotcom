-- =============================================================================
-- OMNI-CHANNEL IMPORT SYSTEM
-- Phase 451-455: Multi-Marketplace Order Integration
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. ORDERS TABLE (Central Order Repository)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner
    user_id UUID NOT NULL,
    -- Source marketplace
    source VARCHAR(50) NOT NULL,
    -- 'shopee', 'tokopedia', 'tiktok', 'lazada', 'manual'
    source_order_id VARCHAR(100),
    -- Original order ID from marketplace
    -- Order info
    order_number VARCHAR(100) NOT NULL,
    order_date TIMESTAMPTZ,
    -- Customer
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    -- Products (JSONB for flexibility)
    products JSONB,
    -- [{name, qty, price, sku}]
    -- Pricing
    subtotal DECIMAL(12, 2) DEFAULT 0,
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    -- Shipping
    courier VARCHAR(50),
    awb_number VARCHAR(50),
    shipping_status VARCHAR(50),
    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'paid', 'refunded'
    -- Status
    order_status VARCHAR(50) DEFAULT 'new',
    -- 'new', 'processing', 'shipped', 'delivered', 'cancelled'
    -- Import metadata
    import_batch_id UUID,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB,
    -- Original row from import
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicates
    UNIQUE(user_id, source, source_order_id)
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_source ON public.orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_awb ON public.orders(awb_number);
-- =============================================================================
-- 2. IMPORT BATCHES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL,
    -- Source
    source VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    -- Stats
    total_rows INTEGER DEFAULT 0,
    imported_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    -- Column mapping used
    column_mapping JSONB,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_import_user ON public.import_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_import_status ON public.import_batches(status);
-- =============================================================================
-- 3. COLUMN MAPPING PRESETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.import_column_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Marketplace
    source VARCHAR(50) NOT NULL UNIQUE,
    -- Column mappings
    order_id_columns TEXT [] NOT NULL,
    order_date_columns TEXT [],
    customer_name_columns TEXT [],
    customer_phone_columns TEXT [],
    customer_address_columns TEXT [],
    product_name_columns TEXT [],
    product_qty_columns TEXT [],
    product_price_columns TEXT [],
    total_columns TEXT [],
    courier_columns TEXT [],
    awb_columns TEXT [],
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 4. SEED: Column Mapping Presets for Marketplaces
-- =============================================================================
INSERT INTO public.import_column_presets (
        source,
        order_id_columns,
        order_date_columns,
        customer_name_columns,
        customer_phone_columns,
        customer_address_columns,
        product_name_columns,
        product_qty_columns,
        product_price_columns,
        total_columns,
        courier_columns,
        awb_columns
    )
VALUES (
        'shopee',
        ARRAY ['No. Pesanan', 'Order ID', 'Nomor Pesanan', 'order_sn'],
        ARRAY ['Waktu Pesanan Dibuat', 'Order Date', 'Tanggal Pesanan', 'create_time'],
        ARRAY ['Nama Pembeli', 'Buyer Name', 'Username Pembeli', 'buyer_username'],
        ARRAY ['No. Telepon', 'Phone', 'Nomor Telepon'],
        ARRAY ['Alamat Pengiriman', 'Shipping Address', 'Alamat'],
        ARRAY ['Nama Produk', 'Product Name', 'Nama Barang'],
        ARRAY ['Jumlah', 'Quantity', 'Qty'],
        ARRAY ['Harga Awal', 'Original Price', 'Harga'],
        ARRAY ['Total Harga', 'Total Amount', 'Grand Total'],
        ARRAY ['Opsi Pengiriman', 'Shipping Option', 'Kurir'],
        ARRAY ['No. Resi', 'Tracking Number', 'AWB']
    ),
    (
        'tokopedia',
        ARRAY ['Nomor Invoice', 'Invoice', 'Order ID'],
        ARRAY ['Tanggal Pembayaran', 'Payment Date', 'Tanggal Order'],
        ARRAY ['Nama Penerima', 'Recipient Name', 'Nama Pembeli'],
        ARRAY ['No HP Penerima', 'Phone', 'Telepon'],
        ARRAY ['Alamat Penerima', 'Address', 'Alamat Pengiriman'],
        ARRAY ['Nama Produk', 'Product Name'],
        ARRAY ['Jumlah Produk Dibeli', 'Quantity', 'Jumlah'],
        ARRAY ['Harga Jual (IDR)', 'Price', 'Harga'],
        ARRAY ['Jumlah Ongkos Kirim', 'Total', 'Grand Total'],
        ARRAY ['Kurir', 'Courier', 'Ekspedisi'],
        ARRAY ['No Resi / Kode Booking', 'AWB', 'Tracking']
    ),
    (
        'tiktok',
        ARRAY ['Order ID', 'Nomor Pesanan', 'order_id'],
        ARRAY ['Created Time', 'Order Date', 'Waktu Dibuat'],
        ARRAY ['Recipient', 'Buyer Name', 'Penerima'],
        ARRAY ['Phone Number', 'Phone', 'Telepon'],
        ARRAY ['Full Address', 'Address', 'Alamat Lengkap'],
        ARRAY ['Product Name', 'SKU Name', 'Nama Produk'],
        ARRAY ['Quantity', 'Qty', 'Jumlah'],
        ARRAY ['SKU Unit Price', 'Price', 'Harga'],
        ARRAY ['Order Amount', 'Total', 'Total Bayar'],
        ARRAY ['Shipping Provider', 'Courier', 'Kurir'],
        ARRAY ['Tracking ID', 'AWB', 'No Resi']
    ),
    (
        'lazada',
        ARRAY ['Order Number', 'orderNumber', 'Nomor Order'],
        ARRAY ['Created at', 'Order Date', 'Tanggal'],
        ARRAY ['Customer Name', 'Shipping Name', 'Nama'],
        ARRAY ['Billing Phone Number', 'Phone'],
        ARRAY ['Shipping Address', 'Address'],
        ARRAY ['Item Name', 'Product Name'],
        ARRAY ['Quantity', 'Qty'],
        ARRAY ['Paid Price', 'Unit Price'],
        ARRAY ['Order Amount', 'Total'],
        ARRAY ['Shipping Provider', 'Courier'],
        ARRAY ['Tracking Code', 'AWB']
    ) ON CONFLICT (source) DO NOTHING;
-- =============================================================================
-- 5. FUNCTION: Import Order (with duplicate check)
-- =============================================================================
CREATE OR REPLACE FUNCTION import_order(
        p_user_id UUID,
        p_source VARCHAR,
        p_source_order_id VARCHAR,
        p_order_number VARCHAR,
        p_order_date TIMESTAMPTZ,
        p_customer_name VARCHAR,
        p_customer_phone VARCHAR,
        p_customer_address TEXT,
        p_products JSONB,
        p_total_amount DECIMAL,
        p_courier VARCHAR,
        p_awb VARCHAR,
        p_import_batch_id UUID,
        p_raw_data JSONB
    ) RETURNS TABLE(
        success BOOLEAN,
        order_id UUID,
        is_duplicate BOOLEAN,
        message TEXT
    ) AS $$
DECLARE v_order_id UUID;
v_existing UUID;
BEGIN -- Check for duplicate
SELECT id INTO v_existing
FROM public.orders
WHERE user_id = p_user_id
    AND source = p_source
    AND source_order_id = p_source_order_id;
IF v_existing IS NOT NULL THEN RETURN QUERY
SELECT false,
    v_existing,
    true,
    'Duplicate order - skipped';
RETURN;
END IF;
-- Insert new order
INSERT INTO public.orders (
        user_id,
        source,
        source_order_id,
        order_number,
        order_date,
        customer_name,
        customer_phone,
        customer_address,
        products,
        total_amount,
        courier,
        awb_number,
        import_batch_id,
        raw_data
    )
VALUES (
        p_user_id,
        p_source,
        p_source_order_id,
        p_order_number,
        p_order_date,
        p_customer_name,
        p_customer_phone,
        p_customer_address,
        p_products,
        p_total_amount,
        p_courier,
        p_awb,
        p_import_batch_id,
        p_raw_data
    )
RETURNING id INTO v_order_id;
RETURN QUERY
SELECT true,
    v_order_id,
    false,
    'Order imported successfully';
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own imports" ON public.import_batches FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.import_column_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read column presets" ON public.import_column_presets FOR
SELECT USING (true);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Omni-Channel Import System created!';
RAISE NOTICE '🛒 Shopee, Tokopedia, TikTok, Lazada supported';
RAISE NOTICE '🔄 Smart column mapping';
RAISE NOTICE '🚫 Duplicate prevention';
END $$;