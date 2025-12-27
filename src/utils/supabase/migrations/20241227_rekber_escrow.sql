-- =============================================================================
-- REKBER (ESCROW) SYSTEM
-- Phase 491-495: Secure COD Transactions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. ESCROW TRANSACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Transaction code
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    -- Parties
    buyer_id UUID NOT NULL,
    seller_id UUID,
    courier_id UUID,
    -- Order reference
    local_order_id UUID REFERENCES public.local_delivery_orders(id),
    -- Amounts
    product_amount DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) NOT NULL,
    admin_fee DECIMAL(12, 2) DEFAULT 1000,
    -- CekKirim fee
    total_amount DECIMAL(12, 2) NOT NULL,
    -- Release code
    release_code VARCHAR(6) NOT NULL,
    -- 6-digit code
    release_code_hash TEXT NOT NULL,
    -- Hashed for security
    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending -> funded -> picked_up -> delivered -> released -> completed
    -- Disbursement
    seller_payout DECIMAL(12, 2),
    courier_payout DECIMAL(12, 2),
    -- Timestamps
    funded_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    -- Expiry
    expires_at TIMESTAMPTZ,
    -- Notes
    notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_code ON public.escrow_transactions(transaction_code);
-- =============================================================================
-- 2. ESCROW HISTORY TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reference
    escrow_id UUID NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
    -- Event
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    -- Actor
    actor_id UUID,
    actor_type VARCHAR(20),
    -- 'buyer', 'seller', 'courier', 'system'
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_escrow_history ON public.escrow_history(escrow_id);
-- =============================================================================
-- 3. FUNCTION: Create Escrow Transaction
-- =============================================================================
CREATE OR REPLACE FUNCTION create_escrow_transaction(
        p_buyer_id UUID,
        p_seller_id UUID,
        p_courier_id UUID,
        p_local_order_id UUID,
        p_product_amount DECIMAL,
        p_shipping_fee DECIMAL
    ) RETURNS TABLE(
        success BOOLEAN,
        escrow_id UUID,
        transaction_code VARCHAR,
        release_code VARCHAR,
        total_amount DECIMAL,
        message TEXT
    ) AS $$
DECLARE v_escrow_id UUID;
v_txn_code VARCHAR;
v_release_code VARCHAR;
v_admin_fee DECIMAL := 1000;
v_total DECIMAL;
v_wallet RECORD;
BEGIN -- Calculate total
v_total := p_product_amount + p_shipping_fee + v_admin_fee;
-- Check buyer wallet balance
SELECT * INTO v_wallet
FROM public.wallets
WHERE user_id = p_buyer_id;
IF NOT FOUND
OR v_wallet.balance < (v_total * 100) THEN RETURN QUERY
SELECT false,
    NULL::UUID,
    NULL::VARCHAR,
    NULL::VARCHAR,
    v_total,
    'Saldo tidak cukup. Butuh: Rp ' || v_total::TEXT;
RETURN;
END IF;
-- Generate codes
v_txn_code := 'RKB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
v_release_code := LPAD((FLOOR(RANDOM() * 1000000))::TEXT, 6, '0');
-- Create escrow
INSERT INTO public.escrow_transactions (
        transaction_code,
        buyer_id,
        seller_id,
        courier_id,
        local_order_id,
        product_amount,
        shipping_fee,
        admin_fee,
        total_amount,
        release_code,
        release_code_hash,
        status,
        funded_at,
        expires_at
    )
VALUES (
        v_txn_code,
        p_buyer_id,
        p_seller_id,
        p_courier_id,
        p_local_order_id,
        p_product_amount,
        p_shipping_fee,
        v_admin_fee,
        v_total,
        v_release_code,
        MD5(v_release_code || v_txn_code),
        -- Simple hash
        'funded',
        NOW(),
        NOW() + INTERVAL '7 days'
    )
RETURNING id INTO v_escrow_id;
-- Deduct from buyer wallet (hold)
UPDATE public.wallets
SET balance = balance - (v_total * 100)::INTEGER,
    updated_at = NOW()
WHERE user_id = p_buyer_id;
-- Log transaction
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
        'hold',
        (v_total * 100)::INTEGER,
        v_wallet.balance,
        v_wallet.balance - (v_total * 100)::INTEGER,
        'Rekber hold: ' || v_txn_code,
        v_txn_code
    );
-- Log history
INSERT INTO public.escrow_history (
        escrow_id,
        event_type,
        description,
        actor_id,
        actor_type
    )
VALUES (
        v_escrow_id,
        'created',
        'Escrow created and funded',
        p_buyer_id,
        'buyer'
    );
RETURN QUERY
SELECT true,
    v_escrow_id,
    v_txn_code,
    v_release_code,
    v_total,
    'Rekber berhasil dibuat! Simpan kode pencairan: ' || v_release_code;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 4. FUNCTION: Release Escrow
-- =============================================================================
CREATE OR REPLACE FUNCTION release_escrow(
        p_escrow_id UUID,
        p_release_code VARCHAR,
        p_actor_id UUID
    ) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE v_escrow RECORD;
v_seller_wallet UUID;
v_courier_wallet UUID;
v_seller_amount DECIMAL;
v_courier_amount DECIMAL;
BEGIN -- Get escrow
SELECT * INTO v_escrow
FROM public.escrow_transactions
WHERE id = p_escrow_id;
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    'Transaksi tidak ditemukan'::TEXT;
RETURN;
END IF;
-- Check status
IF v_escrow.status NOT IN ('funded', 'picked_up', 'delivered') THEN RETURN QUERY
SELECT false,
    'Transaksi tidak bisa dicairkan'::TEXT;
RETURN;
END IF;
-- Verify release code
IF v_escrow.release_code != p_release_code THEN RETURN QUERY
SELECT false,
    'Kode pencairan salah!'::TEXT;
RETURN;
END IF;
-- Calculate payouts
v_seller_amount := v_escrow.product_amount;
v_courier_amount := v_escrow.shipping_fee;
-- Credit seller wallet
IF v_escrow.seller_id IS NOT NULL THEN
SELECT id INTO v_seller_wallet
FROM public.wallets
WHERE user_id = v_escrow.seller_id;
IF v_seller_wallet IS NOT NULL THEN
UPDATE public.wallets
SET balance = balance + (v_seller_amount * 100)::INTEGER
WHERE id = v_seller_wallet;
INSERT INTO public.wallet_transactions (
        wallet_id,
        type,
        amount,
        description,
        reference_id
    )
VALUES (
        v_seller_wallet,
        'credit',
        (v_seller_amount * 100)::INTEGER,
        'Pencairan rekber: ' || v_escrow.transaction_code,
        v_escrow.transaction_code
    );
END IF;
END IF;
-- Credit courier wallet
IF v_escrow.courier_id IS NOT NULL THEN
SELECT id INTO v_courier_wallet
FROM public.wallets
WHERE user_id = v_escrow.courier_id;
IF v_courier_wallet IS NOT NULL THEN
UPDATE public.wallets
SET balance = balance + (v_courier_amount * 100)::INTEGER
WHERE id = v_courier_wallet;
INSERT INTO public.wallet_transactions (
        wallet_id,
        type,
        amount,
        description,
        reference_id
    )
VALUES (
        v_courier_wallet,
        'credit',
        (v_courier_amount * 100)::INTEGER,
        'Ongkir rekber: ' || v_escrow.transaction_code,
        v_escrow.transaction_code
    );
END IF;
END IF;
-- Update escrow status
UPDATE public.escrow_transactions
SET status = 'completed',
    seller_payout = v_seller_amount,
    courier_payout = v_courier_amount,
    released_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
WHERE id = p_escrow_id;
-- Log history
INSERT INTO public.escrow_history (
        escrow_id,
        event_type,
        description,
        actor_id,
        actor_type
    )
VALUES (
        p_escrow_id,
        'released',
        'Escrow released and funds disbursed',
        p_actor_id,
        'courier'
    );
RETURN QUERY
SELECT true,
    'Dana berhasil dicairkan! ✅'::TEXT;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 5. RLS POLICIES
-- =============================================================================
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties can view escrow" ON public.escrow_transactions FOR
SELECT USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR auth.uid() = courier_id
    );
CREATE POLICY "Buyers can create escrow" ON public.escrow_transactions FOR
INSERT WITH CHECK (auth.uid() = buyer_id);
ALTER TABLE public.escrow_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties can view history" ON public.escrow_history FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.escrow_transactions e
            WHERE e.id = escrow_id
                AND (
                    auth.uid() = e.buyer_id
                    OR auth.uid() = e.seller_id
                    OR auth.uid() = e.courier_id
                )
        )
    );
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Rekber (Escrow) System created!';
RAISE NOTICE '💰 Hold fund mechanism';
RAISE NOTICE '🔐 Secure 6-digit release code';
RAISE NOTICE '💸 Auto disbursement to seller & courier';
RAISE NOTICE '🏦 Rp 1,000 admin fee per transaction';
END $$;