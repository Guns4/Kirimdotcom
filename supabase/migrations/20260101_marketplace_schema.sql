-- ==========================================
-- Marketplace Database Schema
-- Physical Store + Digital SMM Services
-- ==========================================
-- ==========================================
-- TABLE 1: Marketplace Products
-- ==========================================
-- Stores both physical (lakban, thermal) and digital (followers, likes) products
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (
        type IN ('PHYSICAL', 'DIGITAL_SMM', 'DIGITAL_FILE')
    ),
    category VARCHAR(50),
    -- PACKING, SMM_INSTAGRAM, SMM_TIKTOK, etc.
    price_base NUMERIC(12, 2) NOT NULL,
    -- Cost price (modal)
    price_sell NUMERIC(12, 2) NOT NULL,
    -- Selling price (harga jual)
    margin NUMERIC(12, 2) GENERATED ALWAYS AS (price_sell - price_base) STORED,
    margin_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN price_base > 0 THEN ((price_sell - price_base) / price_base * 100)
            ELSE 0
        END
    ) STORED,
    stock INT DEFAULT 0,
    -- For physical products only
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    provider_config JSONB,
    -- SMM provider config: {"provider_id": "123", "service_id": "500"}
    metadata JSONB,
    -- Additional data
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_marketplace_products_type ON public.marketplace_products (type, is_active)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products (category, is_active)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_sku ON public.marketplace_products (sku);
-- ==========================================
-- TABLE 2: Marketplace Orders
-- ==========================================
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    trx_id VARCHAR(50) UNIQUE NOT NULL,
    -- ORDER-{timestamp}-{random}
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    -- WALLET, QRIS, VA_BCA, VA_BNI, etc.
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (
        payment_status IN ('UNPAID', 'PAID', 'EXPIRED', 'REFUNDED')
    ),
    order_status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        order_status IN (
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'CANCELED',
            'FAILED'
        )
    ),
    shipping_address JSONB,
    -- For physical products: {"name": "...", "phone": "...", "address": "..."}
    target_input JSONB,
    -- For SMM: {"instagram_username": "...", "tiktok_url": "..."}
    notes TEXT,
    provider_order_id VARCHAR(100),
    -- External order ID from SMM provider
    provider_response JSONB,
    -- Full response from provider
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user ON public.marketplace_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders (order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_trx_id ON public.marketplace_orders (trx_id);
-- ==========================================
-- TABLE 3: Marketplace Order Items
-- ==========================================
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.marketplace_products(id),
    product_sku VARCHAR(50) NOT NULL,
    -- Snapshot at purchase
    product_name VARCHAR(255) NOT NULL,
    -- Snapshot at purchase
    product_type VARCHAR(20) NOT NULL,
    -- Snapshot at purchase
    qty INT NOT NULL CHECK (qty > 0),
    price_at_purchase NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
    ),
    provider_data JSONB,
    -- SMM provider response for this item
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_order ON public.marketplace_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_product ON public.marketplace_order_items (product_id);
-- ==========================================
-- AUTO-UPDATE TRIGGERS
-- ==========================================
-- Products timestamp
CREATE TRIGGER update_marketplace_products_timestamp BEFORE
UPDATE ON public.marketplace_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Orders timestamp
CREATE TRIGGER update_marketplace_orders_timestamp BEFORE
UPDATE ON public.marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
-- Products (public read)
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.marketplace_products FOR
SELECT USING (is_active = true);
CREATE POLICY "Service role can manage products" ON public.marketplace_products FOR ALL USING (true);
-- Orders (user-specific)
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.marketplace_orders FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.marketplace_orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage orders" ON public.marketplace_orders FOR ALL USING (true);
-- Order Items (via orders)
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.marketplace_order_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.marketplace_orders
            WHERE id = order_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Service role can manage order items" ON public.marketplace_order_items FOR ALL USING (true);
-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================
-- Function to deduct stock
CREATE OR REPLACE FUNCTION deduct_product_stock(p_product_id UUID, p_quantity INT) RETURNS TABLE (
        success BOOLEAN,
        message TEXT,
        new_stock INT
    ) AS $$
DECLARE v_current_stock INT;
v_new_stock INT;
v_product_type VARCHAR(20);
BEGIN -- Get current stock and type
SELECT stock,
    type INTO v_current_stock,
    v_product_type
FROM public.marketplace_products
WHERE id = p_product_id FOR
UPDATE;
-- Check if product exists
IF v_current_stock IS NULL THEN RETURN QUERY
SELECT false,
    'Product not found'::TEXT,
    0;
RETURN;
END IF;
-- Digital products have unlimited stock
IF v_product_type LIKE 'DIGITAL%' THEN RETURN QUERY
SELECT true,
    'Digital product - no stock deduction needed'::TEXT,
    999999;
RETURN;
END IF;
-- Check sufficient stock for physical products
IF v_current_stock < p_quantity THEN RETURN QUERY
SELECT false,
    'Insufficient stock'::TEXT,
    v_current_stock;
RETURN;
END IF;
-- Deduct stock
UPDATE public.marketplace_products
SET stock = stock - p_quantity,
    updated_at = NOW()
WHERE id = p_product_id
RETURNING stock INTO v_new_stock;
RETURN QUERY
SELECT true,
    'Stock deducted successfully'::TEXT,
    v_new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- SEED DATA (Initial Products)
-- ==========================================
INSERT INTO public.marketplace_products (
        sku,
        name,
        type,
        category,
        price_base,
        price_sell,
        stock,
        description,
        is_featured
    )
VALUES -- Physical Products (Packing Supplies)
    (
        'LAKBAN-BENING-100',
        'Lakban Bening 100 Yard (Daimaru)',
        'PHYSICAL',
        'PACKING',
        8500,
        12000,
        100,
        'Lakban wajib seller, daya rekat kuat. Cocok untuk semua jenis paket.',
        true
    ),
    (
        'LAKBAN-COKLAT-100',
        'Lakban Coklat 100 Yard (Daimaru)',
        'PHYSICAL',
        'PACKING',
        8200,
        11500,
        100,
        'Lakban coklat standar ekspedisi. Tahan lama dan kuat.',
        false
    ),
    (
        'THERMAL-100x150',
        'Kertas Thermal 100x150mm (Isi 500 Lembar)',
        'PHYSICAL',
        'PACKING',
        25000,
        35000,
        50,
        'Label resi tahan air dan minyak. Compatible dengan printer thermal.',
        true
    ),
    (
        'BUBBLEWRAP-125',
        'Bubble Wrap 125cm x 50m',
        'PHYSICAL',
        'PACKING',
        45000,
        65000,
        30,
        'Pelindung paket dari benturan. Gelembung besar untuk proteksi maksimal.',
        false
    ),
    (
        'KARDUS-S',
        'Kardus Packing 20x15x10cm (Isi 25 Pcs)',
        'PHYSICAL',
        'PACKING',
        35000,
        50000,
        40,
        'Kardus standar untuk paket kecil. Material tebal dan kokoh.',
        false
    ),
    -- Digital SMM Products (Instagram)
    (
        'IG-FOLLOWERS-1K',
        '1000 Instagram Followers (High Quality)',
        'DIGITAL_SMM',
        'SMM_INSTAGRAM',
        15000,
        35000,
        999999,
        'Followers real account, garansi refill 30 hari. Proses 1-24 jam. Masukkan username tanpa @.',
        true
    ),
    (
        'IG-FOLLOWERS-5K',
        '5000 Instagram Followers (High Quality)',
        'DIGITAL_SMM',
        'SMM_INSTAGRAM',
        65000,
        150000,
        999999,
        'Followers premium dengan engagement tinggi. Garansi refill 30 hari. Proses 1-3 hari.',
        false
    ),
    (
        'IG-LIKES-1K',
        '1000 Instagram Likes',
        'DIGITAL_SMM',
        'SMM_INSTAGRAM',
        8000,
        20000,
        999999,
        'Likes instant untuk post Anda. Proses 0-6 jam. Masukkan link post.',
        false
    ),
    -- Digital SMM Products (TikTok)
    (
        'TT-FOLLOWERS-1K',
        '1000 TikTok Followers',
        'DIGITAL_SMM',
        'SMM_TIKTOK',
        12000,
        30000,
        999999,
        'Followers TikTok real account. Garansi refill 30 hari. Masukkan username tanpa @.',
        false
    ),
    (
        'TT-VIEWS-10K',
        '10000 TikTok Views',
        'DIGITAL_SMM',
        'SMM_TIKTOK',
        5000,
        15000,
        999999,
        'Views untuk video TikTok. Proses instant. Masukkan link video.',
        false
    ) ON CONFLICT (sku) DO NOTHING;
-- ==========================================
-- COMMENTS (Documentation)
-- ==========================================
COMMENT ON TABLE public.marketplace_products IS 'Hybrid product catalog - physical packing supplies and digital SMM services';
COMMENT ON TABLE public.marketplace_orders IS 'Customer orders for marketplace products';
COMMENT ON TABLE public.marketplace_order_items IS 'Individual items within orders';
COMMENT ON COLUMN public.marketplace_products.margin IS 'Auto-calculated profit margin (price_sell - price_base)';
COMMENT ON COLUMN public.marketplace_products.margin_percent IS 'Auto-calculated profit margin percentage';
COMMENT ON COLUMN public.marketplace_products.provider_config IS 'SMM provider configuration (API endpoints, service IDs)';
-- ==========================================
-- MIGRATION COMPLETE ✅
-- ==========================================