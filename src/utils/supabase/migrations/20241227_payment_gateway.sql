-- ============================================================================
-- PAYMENT GATEWAY & TRANSACTIONS
-- Phase 391-395: Real Money Payment Processing
-- ============================================================================
-- ============================================================================
-- 1. PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL,
    -- Order details
    order_type VARCHAR(50) NOT NULL,
    -- 'ppob', 'ebook', 'subscription', 'pulsa'
    order_id VARCHAR(255) NOT NULL UNIQUE,
    -- Product details
    product_name VARCHAR(255) NOT NULL,
    product_data JSONB,
    -- Additional product info
    -- Payment details
    gross_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    -- Midtrans data
    transaction_id VARCHAR(255),
    snap_token TEXT,
    redirect_url TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'success', 'failed', 'expired'
    payment_status VARCHAR(50),
    -- From Midtrans: 'settlement', 'pending', 'deny', 'expire'
    -- Fulfillment
    is_fulfilled BOOLEAN DEFAULT false,
    fulfilled_at TIMESTAMPTZ,
    fulfillment_data JSONB,
    fulfillment_error TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_midtrans ON public.payment_transactions(transaction_id);
-- ============================================================================
-- 2. WEBHOOK LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Webhook source
    source VARCHAR(50) NOT NULL,
    -- 'midtrans', 'digiflazz', etc
    -- Request data
    payload JSONB NOT NULL,
    headers JSONB,
    -- Processing
    status VARCHAR(20) DEFAULT 'received',
    -- 'received', 'processed', 'failed'
    error_message TEXT,
    -- Reference
    order_id VARCHAR(255),
    transaction_id VARCHAR(255),
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON public.webhook_logs(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order ON public.webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
-- ============================================================================
-- 3. PPOB ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ppob_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reference to payment
    payment_id UUID REFERENCES public.payment_transactions(id) ON DELETE
    SET NULL,
        -- User
        user_id UUID NOT NULL,
        -- Product details
        product_code VARCHAR(100) NOT NULL,
        -- From PPOB provider
        destination VARCHAR(50) NOT NULL,
        -- Phone number
        operator VARCHAR(50) NOT NULL,
        nominal INTEGER NOT NULL,
        -- Pricing
        base_price DECIMAL(10, 2) NOT NULL,
        selling_price DECIMAL(10, 2) NOT NULL,
        admin_fee DECIMAL(10, 2) DEFAULT 1000,
        -- Provider data
        provider VARCHAR(50) DEFAULT 'digiflazz',
        ref_id VARCHAR(255),
        -- Provider's transaction ID
        sn TEXT,
        -- Serial number from provider (for vouchers)
        -- Status
        status VARCHAR(20) DEFAULT 'pending',
        -- 'pending', 'processing', 'success', 'failed'
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ppob_orders_user ON public.ppob_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ppob_orders_payment ON public.ppob_orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_ppob_orders_status ON public.ppob_orders(status);
-- ============================================================================
-- 4. FUNCTION: Create Payment Transaction
-- ============================================================================
CREATE OR REPLACE FUNCTION create_payment_transaction(
        p_user_id UUID,
        p_order_type VARCHAR,
        p_product_name VARCHAR,
        p_gross_amount DECIMAL,
        p_product_data JSONB DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_transaction_id UUID;
v_order_id VARCHAR;
BEGIN -- Generate unique order ID
v_order_id := 'ORD-' || EXTRACT(
    EPOCH
    FROM NOW()
)::BIGINT || '-' || floor(random() * 10000)::INTEGER;
-- Create transaction
INSERT INTO public.payment_transactions (
        user_id,
        order_type,
        order_id,
        product_name,
        product_data,
        gross_amount,
        status
    )
VALUES (
        p_user_id,
        p_order_type,
        v_order_id,
        p_product_name,
        p_product_data,
        p_gross_amount,
        'pending'
    )
RETURNING id INTO v_transaction_id;
RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTION: Update Payment Status
-- ============================================================================
CREATE OR REPLACE FUNCTION update_payment_status(
        p_order_id VARCHAR,
        p_status VARCHAR,
        p_payment_method VARCHAR DEFAULT NULL,
        p_transaction_id VARCHAR DEFAULT NULL
    ) RETURNS VOID AS $$ BEGIN
UPDATE public.payment_transactions
SET status = p_status,
    payment_status = p_status,
    payment_method = COALESCE(p_payment_method, payment_method),
    transaction_id = COALESCE(p_transaction_id, transaction_id),
    paid_at = CASE
        WHEN p_status = 'success' THEN NOW()
        ELSE paid_at
    END,
    updated_at = NOW()
WHERE order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.ppob_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.ppob_orders FOR
SELECT USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Payment Gateway infrastructure created!';
RAISE NOTICE '💳 Payment transactions table ready';
RAISE NOTICE '📱 PPOB orders tracking enabled';
RAISE NOTICE '🔔 Webhook logging configured';
RAISE NOTICE '💰 Ready for Midtrans integration!';
END $$;