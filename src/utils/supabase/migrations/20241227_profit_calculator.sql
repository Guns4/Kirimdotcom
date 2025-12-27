-- =============================================================================
-- PROFIT CALCULATOR SYSTEM
-- Phase 456-460: Financial Clarity for Sellers
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. PRODUCTS TABLE (with HPP/Cost)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner
    user_id UUID NOT NULL,
    -- Product info
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Pricing
    selling_price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2) DEFAULT 0,
    -- HPP (Harga Pokok Penjualan)
    -- Margins (auto-calculated)
    profit_margin DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN selling_price > 0 THEN (
                (selling_price - cost_price) / selling_price * 100
            )
            ELSE 0
        END
    ) STORED,
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    -- Category
    category VARCHAR(100),
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_products_user ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
-- =============================================================================
-- 2. MARKETPLACE FEE SETTINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User (or NULL for global defaults)
    user_id UUID,
    -- Marketplace
    marketplace VARCHAR(50) NOT NULL,
    -- Fee structure
    admin_fee_percent DECIMAL(5, 2) DEFAULT 0,
    -- Platform commission %
    payment_fee_percent DECIMAL(5, 2) DEFAULT 0,
    -- Payment gateway %
    fixed_fee DECIMAL(10, 2) DEFAULT 0,
    -- Fixed fee per transaction
    -- Shipping
    free_shipping_fee DECIMAL(10, 2) DEFAULT 0,
    -- If seller bears shipping
    -- Notes
    notes TEXT,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, marketplace)
);
CREATE INDEX IF NOT EXISTS idx_fees_user ON public.marketplace_fees(user_id);
-- =============================================================================
-- 3. SEED: Default Marketplace Fees (2024 rates)
-- =============================================================================
INSERT INTO public.marketplace_fees (
        user_id,
        marketplace,
        admin_fee_percent,
        payment_fee_percent,
        notes
    )
VALUES (
        NULL,
        'shopee',
        6.5,
        2.0,
        'Gratis Ongkir XTRA: tambah 4-6%'
    ),
    (
        NULL,
        'tokopedia',
        4.0,
        1.5,
        'Power Merchant: 2-4%'
    ),
    (
        NULL,
        'tiktok',
        5.0,
        2.0,
        'Seller Center standard'
    ),
    (NULL, 'lazada', 5.5, 2.0, 'Standard seller tier'),
    (NULL, 'bukalapak', 3.5, 1.5, 'Basic seller'),
    (NULL, 'blibli', 5.0, 2.0, 'Standard merchant') ON CONFLICT DO NOTHING;
-- =============================================================================
-- 4. PROFIT CALCULATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_profits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Revenue
    gross_sales DECIMAL(12, 2) NOT NULL,
    -- Costs
    cost_of_goods DECIMAL(12, 2) DEFAULT 0,
    -- HPP
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    -- Ongkir yang ditanggung seller
    admin_fee DECIMAL(12, 2) DEFAULT 0,
    -- Marketplace fee
    payment_fee DECIMAL(12, 2) DEFAULT 0,
    -- Payment gateway fee
    other_costs DECIMAL(12, 2) DEFAULT 0,
    -- Packaging, etc.
    -- Profit
    net_profit DECIMAL(12, 2) GENERATED ALWAYS AS (
        gross_sales - cost_of_goods - shipping_cost - admin_fee - payment_fee - other_costs
    ) STORED,
    -- Margin
    profit_margin_percent DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN gross_sales > 0 THEN (
                (
                    gross_sales - cost_of_goods - shipping_cost - admin_fee - payment_fee - other_costs
                ) / gross_sales * 100
            )
            ELSE 0
        END
    ) STORED,
    -- Flags
    is_loss BOOLEAN GENERATED ALWAYS AS (
        (
            gross_sales - cost_of_goods - shipping_cost - admin_fee - payment_fee - other_costs
        ) < 0
    ) STORED,
    -- Timestamps
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profits_user ON public.order_profits(user_id);
CREATE INDEX IF NOT EXISTS idx_profits_order ON public.order_profits(order_id);
CREATE INDEX IF NOT EXISTS idx_profits_loss ON public.order_profits(is_loss);
-- =============================================================================
-- 5. FUNCTION: Calculate Order Profit
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_order_profit(p_order_id UUID) RETURNS TABLE(
        gross_sales DECIMAL,
        cost_of_goods DECIMAL,
        shipping_cost DECIMAL,
        admin_fee DECIMAL,
        payment_fee DECIMAL,
        net_profit DECIMAL,
        margin_percent DECIMAL,
        is_loss BOOLEAN
    ) AS $$
DECLARE v_order RECORD;
v_fee RECORD;
v_hpp DECIMAL := 0;
v_admin DECIMAL := 0;
v_payment DECIMAL := 0;
v_net DECIMAL := 0;
BEGIN -- Get order
SELECT * INTO v_order
FROM public.orders
WHERE id = p_order_id;
IF NOT FOUND THEN RETURN;
END IF;
-- Get marketplace fees
SELECT * INTO v_fee
FROM public.marketplace_fees
WHERE (
        user_id = v_order.user_id
        OR user_id IS NULL
    )
    AND marketplace = v_order.source
ORDER BY user_id NULLS LAST
LIMIT 1;
-- Calculate HPP from products (if linked)
SELECT COALESCE(SUM(p.cost_price * (item->>'qty')::INTEGER), 0) INTO v_hpp
FROM jsonb_array_elements(v_order.products) AS item
    LEFT JOIN public.products p ON p.user_id = v_order.user_id
    AND (
        p.sku = item->>'sku'
        OR p.name = item->>'name'
    );
-- Calculate fees
IF v_fee IS NOT NULL THEN v_admin := v_order.total_amount * (v_fee.admin_fee_percent / 100);
v_payment := v_order.total_amount * (v_fee.payment_fee_percent / 100);
END IF;
-- Calculate net profit
v_net := v_order.total_amount - v_hpp - COALESCE(v_order.shipping_cost, 0) - v_admin - v_payment;
-- Return result
RETURN QUERY
SELECT v_order.total_amount,
    v_hpp,
    COALESCE(v_order.shipping_cost, 0),
    v_admin,
    v_payment,
    v_net,
    CASE
        WHEN v_order.total_amount > 0 THEN (v_net / v_order.total_amount * 100)::DECIMAL(5, 2)
        ELSE 0
    END,
    v_net < 0;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. FUNCTION: Get Profit Summary
-- =============================================================================
CREATE OR REPLACE FUNCTION get_profit_summary(
        p_user_id UUID,
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL
    ) RETURNS TABLE(
        total_orders INTEGER,
        gross_sales DECIMAL,
        total_hpp DECIMAL,
        total_shipping DECIMAL,
        total_admin_fees DECIMAL,
        total_payment_fees DECIMAL,
        net_profit DECIMAL,
        avg_margin DECIMAL,
        loss_count INTEGER,
        loss_amount DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(*)::INTEGER,
    COALESCE(SUM(op.gross_sales), 0),
    COALESCE(SUM(op.cost_of_goods), 0),
    COALESCE(SUM(op.shipping_cost), 0),
    COALESCE(SUM(op.admin_fee), 0),
    COALESCE(SUM(op.payment_fee), 0),
    COALESCE(SUM(op.net_profit), 0),
    COALESCE(AVG(op.profit_margin_percent), 0)::DECIMAL(5, 2),
    COUNT(*) FILTER (
        WHERE op.is_loss = true
    )::INTEGER,
    COALESCE(
        SUM(op.net_profit) FILTER (
            WHERE op.is_loss = true
        ),
        0
    )
FROM public.order_profits op
    JOIN public.orders o ON o.id = op.order_id
WHERE op.user_id = p_user_id
    AND (
        p_from_date IS NULL
        OR o.order_date >= p_from_date
    )
    AND (
        p_to_date IS NULL
        OR o.order_date <= p_to_date
    );
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. RLS POLICIES
-- =============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own products" ON public.products FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.marketplace_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view default and own fees" ON public.marketplace_fees FOR
SELECT USING (
        user_id IS NULL
        OR auth.uid() = user_id
    );
CREATE POLICY "Users can manage own fees" ON public.marketplace_fees FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.order_profits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profits" ON public.order_profits FOR ALL USING (auth.uid() = user_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Profit Calculator System created!';
RAISE NOTICE '💰 HPP (cost) tracking enabled';
RAISE NOTICE '📊 Marketplace fee configuration';
RAISE NOTICE '📉 Net profit analysis with loss warnings';
END $$;