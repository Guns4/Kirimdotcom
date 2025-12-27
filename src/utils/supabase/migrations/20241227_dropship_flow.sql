-- =============================================================================
-- DROPSHIP FLOW SYSTEM
-- Phase 471-475: Order Flow Automation for Resellers & Suppliers
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. RESELLER CONNECTIONS (Approved Resellers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reseller_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Connection
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    reseller_id UUID NOT NULL,
    -- User ID of reseller
    -- Reseller info
    reseller_name VARCHAR(255) NOT NULL,
    reseller_phone VARCHAR(20),
    store_name VARCHAR(255),
    -- Custom sender name
    -- Pricing tier
    price_tier VARCHAR(50) DEFAULT 'standard',
    -- 'standard', 'silver', 'gold', 'platinum'
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    -- Stats
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(14, 2) DEFAULT 0,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'active', 'suspended', 'terminated'
    -- Timestamps
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    UNIQUE(supplier_id, reseller_id)
);
CREATE INDEX IF NOT EXISTS idx_connections_supplier ON public.reseller_connections(supplier_id);
CREATE INDEX IF NOT EXISTS idx_connections_reseller ON public.reseller_connections(reseller_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.reseller_connections(status);
-- =============================================================================
-- 2. DROPSHIP ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dropship_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Parties
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    reseller_id UUID NOT NULL,
    connection_id UUID REFERENCES public.reseller_connections(id),
    -- Order info
    order_number VARCHAR(100) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    -- Products
    products JSONB NOT NULL,
    -- [{product_id, name, qty, reseller_price, supplier_price}]
    -- Pricing
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    reseller_profit DECIMAL(12, 2) DEFAULT 0,
    -- Customer (End buyer)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(10),
    -- Custom Sender (Reseller's store name)
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20),
    -- Shipping
    courier VARCHAR(50),
    awb_number VARCHAR(50),
    shipping_status VARCHAR(50) DEFAULT 'pending',
    -- Status
    order_status VARCHAR(30) DEFAULT 'pending',
    -- pending -> confirmed -> processing -> shipped -> delivered
    -- Notes
    reseller_notes TEXT,
    supplier_notes TEXT,
    -- Payment
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    payment_proof_url TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_dropship_supplier ON public.dropship_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_dropship_reseller ON public.dropship_orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_dropship_status ON public.dropship_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_dropship_awb ON public.dropship_orders(awb_number);
CREATE INDEX IF NOT EXISTS idx_dropship_date ON public.dropship_orders(order_date DESC);
-- =============================================================================
-- 3. DROPSHIP ORDER HISTORY (Status changes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dropship_order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reference
    order_id UUID NOT NULL REFERENCES public.dropship_orders(id) ON DELETE CASCADE,
    -- Change
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID,
    changed_by_role VARCHAR(20),
    -- 'supplier', 'reseller', 'system'
    -- Note
    note TEXT,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_history ON public.dropship_order_history(order_id);
-- =============================================================================
-- 4. FUNCTION: Create Dropship Order
-- =============================================================================
CREATE OR REPLACE FUNCTION create_dropship_order(
        p_reseller_id UUID,
        p_supplier_id UUID,
        p_products JSONB,
        p_customer_name VARCHAR,
        p_customer_phone VARCHAR,
        p_customer_address TEXT,
        p_customer_city VARCHAR,
        p_sender_name VARCHAR,
        p_sender_phone VARCHAR,
        p_courier VARCHAR,
        p_notes TEXT DEFAULT NULL
    ) RETURNS TABLE(
        success BOOLEAN,
        order_id UUID,
        order_number VARCHAR,
        message TEXT
    ) AS $$
DECLARE v_connection RECORD;
v_order_id UUID;
v_order_num VARCHAR;
v_subtotal DECIMAL := 0;
v_product JSONB;
BEGIN -- Check connection
SELECT * INTO v_connection
FROM public.reseller_connections
WHERE supplier_id = p_supplier_id
    AND reseller_id = p_reseller_id
    AND status = 'active';
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    NULL::UUID,
    NULL::VARCHAR,
    'Not connected to this supplier';
RETURN;
END IF;
-- Calculate subtotal
FOR v_product IN
SELECT *
FROM jsonb_array_elements(p_products) LOOP v_subtotal := v_subtotal + (
        (v_product->>'reseller_price')::DECIMAL * (v_product->>'qty')::INTEGER
    );
END LOOP;
-- Generate order number
v_order_num := 'DS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
-- Create order
INSERT INTO public.dropship_orders (
        supplier_id,
        reseller_id,
        connection_id,
        order_number,
        products,
        subtotal,
        total_amount,
        customer_name,
        customer_phone,
        customer_address,
        customer_city,
        sender_name,
        sender_phone,
        courier,
        reseller_notes
    )
VALUES (
        p_supplier_id,
        p_reseller_id,
        v_connection.id,
        v_order_num,
        p_products,
        v_subtotal,
        v_subtotal,
        p_customer_name,
        p_customer_phone,
        p_customer_address,
        p_customer_city,
        p_sender_name,
        p_sender_phone,
        p_courier,
        p_notes
    )
RETURNING id INTO v_order_id;
-- Log history
INSERT INTO public.dropship_order_history (
        order_id,
        new_status,
        changed_by,
        changed_by_role
    )
VALUES (v_order_id, 'pending', p_reseller_id, 'reseller');
RETURN QUERY
SELECT true,
    v_order_id,
    v_order_num,
    'Order created successfully!';
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. FUNCTION: Supplier Update Order (Add AWB)
-- =============================================================================
CREATE OR REPLACE FUNCTION supplier_update_dropship(
        p_order_id UUID,
        p_supplier_user_id UUID,
        p_status VARCHAR,
        p_awb VARCHAR DEFAULT NULL,
        p_notes TEXT DEFAULT NULL
    ) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE v_order RECORD;
v_supplier RECORD;
BEGIN -- Get supplier
SELECT * INTO v_supplier
FROM public.suppliers
WHERE user_id = p_supplier_user_id;
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    'Not a supplier';
RETURN;
END IF;
-- Get order
SELECT * INTO v_order
FROM public.dropship_orders
WHERE id = p_order_id
    AND supplier_id = v_supplier.id;
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    'Order not found';
RETURN;
END IF;
-- Update order
UPDATE public.dropship_orders
SET order_status = p_status,
    awb_number = COALESCE(p_awb, awb_number),
    supplier_notes = COALESCE(p_notes, supplier_notes),
    shipped_at = CASE
        WHEN p_status = 'shipped' THEN NOW()
        ELSE shipped_at
    END,
    updated_at = NOW()
WHERE id = p_order_id;
-- Log history
INSERT INTO public.dropship_order_history (
        order_id,
        old_status,
        new_status,
        changed_by,
        changed_by_role,
        note
    )
VALUES (
        p_order_id,
        v_order.order_status,
        p_status,
        p_supplier_user_id,
        'supplier',
        p_notes
    );
RETURN QUERY
SELECT true,
    'Order updated successfully!';
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================
ALTER TABLE public.reseller_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers can manage connections" ON public.reseller_connections FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.suppliers
        WHERE id = supplier_id
            AND user_id = auth.uid()
    )
);
CREATE POLICY "Resellers can view own connections" ON public.reseller_connections FOR
SELECT USING (auth.uid() = reseller_id);
ALTER TABLE public.dropship_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers can view orders" ON public.dropship_orders FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.suppliers
            WHERE id = supplier_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Resellers can manage own orders" ON public.dropship_orders FOR ALL USING (auth.uid() = reseller_id);
ALTER TABLE public.dropship_order_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties can view order history" ON public.dropship_order_history FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.dropship_orders o
            WHERE o.id = order_id
                AND (
                    o.reseller_id = auth.uid()
                    OR EXISTS (
                        SELECT 1
                        FROM public.suppliers s
                        WHERE s.id = o.supplier_id
                            AND s.user_id = auth.uid()
                    )
                )
        )
    );
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Dropship Flow System created!';
RAISE NOTICE '🔗 Reseller-Supplier connections';
RAISE NOTICE '📦 Custom sender name orders';
RAISE NOTICE '📋 Supplier dropship dashboard';
RAISE NOTICE '🔄 AWB auto-sync to reseller';
END $$;