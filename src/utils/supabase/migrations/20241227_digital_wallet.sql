-- ============================================================================
-- DIGITAL WALLET SYSTEM - ACID COMPLIANT
-- Phase 211-215: Seller Balance & Transaction Management
-- ============================================================================
-- ============================================================================
-- 1. WALLET ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner info
    user_id UUID NOT NULL UNIQUE,
    -- Balance (in smallest currency unit - cents for IDR)
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    balance_idr DECIMAL(15, 2) GENERATED ALWAYS AS (balance / 100.0) STORED,
    -- Holds (pending transactions)
    hold_amount BIGINT NOT NULL DEFAULT 0 CHECK (hold_amount >= 0),
    available_balance BIGINT GENERATED ALWAYS AS (balance - hold_amount) STORED,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_frozen BOOLEAN DEFAULT false,
    -- Security
    last_transaction_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    -- Optimistic locking
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON public.wallet_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_active ON public.wallet_accounts(is_active);
-- ============================================================================
-- 2. WALLET TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- From/To accounts
    from_wallet_id UUID REFERENCES public.wallet_accounts(id),
    to_wallet_id UUID REFERENCES public.wallet_accounts(id),
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL,
    -- Types: 'deposit', 'withdrawal', 'transfer', 'refund', 'payment', 'commission'
    amount BIGINT NOT NULL CHECK (amount > 0),
    amount_idr DECIMAL(15, 2) GENERATED ALWAYS AS (amount / 100.0) STORED,
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: 'pending', 'processing', 'completed', 'failed', 'cancelled'
    -- Reference
    reference_type VARCHAR(50),
    -- 'order', 'paylater', 'affiliate', etc.
    reference_id UUID,
    -- Description
    description TEXT,
    -- Idempotency key (prevent duplicate transactions)
    idempotency_key VARCHAR(255) UNIQUE,
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    -- Timestamps
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_from ON public.wallet_transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_to ON public.wallet_transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON public.wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref ON public.wallet_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at);
-- ============================================================================
-- 3. WALLET TRANSACTION HOLDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Wallet
    wallet_id UUID NOT NULL REFERENCES public.wallet_accounts(id),
    -- Hold details
    amount BIGINT NOT NULL CHECK (amount > 0),
    reason VARCHAR(100) NOT NULL,
    reference_id UUID,
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    -- 'active', 'released', 'captured'
    -- Expiry
    expires_at TIMESTAMPTZ,
    -- Timestamps
    released_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallet_holds_wallet ON public.wallet_holds(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_holds_status ON public.wallet_holds(status);
-- ============================================================================
-- 4. ATOMIC TRANSACTION FUNCTIONS
-- ============================================================================
-- Create wallet for new user
CREATE OR REPLACE FUNCTION create_wallet_account(p_user_id UUID) RETURNS UUID AS $$
DECLARE v_wallet_id UUID;
BEGIN
INSERT INTO public.wallet_accounts (user_id, balance)
VALUES (p_user_id, 0) ON CONFLICT (user_id) DO NOTHING
RETURNING id INTO v_wallet_id;
RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql;
-- Deposit money (ACID compliant)
CREATE OR REPLACE FUNCTION wallet_deposit(
        p_wallet_id UUID,
        p_amount BIGINT,
        p_description TEXT,
        p_idempotency_key VARCHAR
    ) RETURNS UUID AS $$
DECLARE v_tx_id UUID;
BEGIN -- Check idempotency
SELECT id INTO v_tx_id
FROM public.wallet_transactions
WHERE idempotency_key = p_idempotency_key;
IF FOUND THEN RETURN v_tx_id;
-- Already processed
END IF;
v_tx_id := uuid_generate_v4();
-- Begin atomic operation
-- 1. Create transaction record
INSERT INTO public.wallet_transactions (
        id,
        to_wallet_id,
        transaction_type,
        amount,
        description,
        status,
        idempotency_key
    )
VALUES (
        v_tx_id,
        p_wallet_id,
        'deposit',
        p_amount,
        p_description,
        'completed',
        p_idempotency_key
    );
-- 2. Update wallet balance (atomic)
UPDATE public.wallet_accounts
SET balance = balance + p_amount,
    last_transaction_at = NOW(),
    version = version + 1,
    updated_at = NOW()
WHERE id = p_wallet_id
    AND is_active = true
    AND is_frozen = false;
IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not active or frozen';
END IF;
RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql;
-- Withdraw money (ACID compliant)
CREATE OR REPLACE FUNCTION wallet_withdraw(
        p_wallet_id UUID,
        p_amount BIGINT,
        p_description TEXT,
        p_idempotency_key VARCHAR
    ) RETURNS UUID AS $$
DECLARE v_tx_id UUID;
v_available_balance BIGINT;
BEGIN -- Check idempotency
SELECT id INTO v_tx_id
FROM public.wallet_transactions
WHERE idempotency_key = p_idempotency_key;
IF FOUND THEN RETURN v_tx_id;
END IF;
v_tx_id := uuid_generate_v4();
-- Check available balance with row lock
SELECT available_balance INTO v_available_balance
FROM public.wallet_accounts
WHERE id = p_wallet_id FOR
UPDATE;
-- Lock row
IF v_available_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance';
END IF;
-- Create transaction
INSERT INTO public.wallet_transactions (
        id,
        from_wallet_id,
        transaction_type,
        amount,
        description,
        status,
        idempotency_key
    )
VALUES (
        v_tx_id,
        p_wallet_id,
        'withdrawal',
        p_amount,
        p_description,
        'completed',
        p_idempotency_key
    );
-- Update balance
UPDATE public.wallet_accounts
SET balance = balance - p_amount,
    last_transaction_at = NOW(),
    version = version + 1,
    updated_at = NOW()
WHERE id = p_wallet_id;
RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql;
-- Transfer between wallets (ACID compliant)
CREATE OR REPLACE FUNCTION wallet_transfer(
        p_from_wallet_id UUID,
        p_to_wallet_id UUID,
        p_amount BIGINT,
        p_description TEXT,
        p_idempotency_key VARCHAR
    ) RETURNS UUID AS $$
DECLARE v_tx_id UUID;
v_available_balance BIGINT;
BEGIN -- Prevent self-transfer
IF p_from_wallet_id = p_to_wallet_id THEN RAISE EXCEPTION 'Cannot transfer to same wallet';
END IF;
-- Check idempotency
SELECT id INTO v_tx_id
FROM public.wallet_transactions
WHERE idempotency_key = p_idempotency_key;
IF FOUND THEN RETURN v_tx_id;
END IF;
v_tx_id := uuid_generate_v4();
-- Lock both wallets (ordered to prevent deadlock)
IF p_from_wallet_id < p_to_wallet_id THEN PERFORM 1
FROM public.wallet_accounts
WHERE id = p_from_wallet_id FOR
UPDATE;
PERFORM 1
FROM public.wallet_accounts
WHERE id = p_to_wallet_id FOR
UPDATE;
ELSE PERFORM 1
FROM public.wallet_accounts
WHERE id = p_to_wallet_id FOR
UPDATE;
PERFORM 1
FROM public.wallet_accounts
WHERE id = p_from_wallet_id FOR
UPDATE;
END IF;
-- Check balance
SELECT available_balance INTO v_available_balance
FROM public.wallet_accounts
WHERE id = p_from_wallet_id;
IF v_available_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance';
END IF;
-- Create transaction
INSERT INTO public.wallet_transactions (
        id,
        from_wallet_id,
        to_wallet_id,
        transaction_type,
        amount,
        description,
        status,
        idempotency_key
    )
VALUES (
        v_tx_id,
        p_from_wallet_id,
        p_to_wallet_id,
        'transfer',
        p_amount,
        p_description,
        'completed',
        p_idempotency_key
    );
-- Update both balances atomically
UPDATE public.wallet_accounts
SET balance = balance - p_amount,
    last_transaction_at = NOW(),
    version = version + 1,
    updated_at = NOW()
WHERE id = p_from_wallet_id;
UPDATE public.wallet_accounts
SET balance = balance + p_amount,
    last_transaction_at = NOW(),
    version = version + 1,
    updated_at = NOW()
WHERE id = p_to_wallet_id;
RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet" ON public.wallet_accounts FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR
SELECT USING (
        from_wallet_id IN (
            SELECT id
            FROM public.wallet_accounts
            WHERE user_id = auth.uid()
        )
        OR to_wallet_id IN (
            SELECT id
            FROM public.wallet_accounts
            WHERE user_id = auth.uid()
        )
    );
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Digital Wallet system created successfully!';
RAISE NOTICE '💰 Tables: wallet_accounts, wallet_transactions, wallet_holds';
RAISE NOTICE '🔒 ACID compliance: Atomic operations with row locking';
RAISE NOTICE '🛡️ Idempotency: Duplicate transaction prevention';
RAISE NOTICE '⚡ Functions: deposit, withdraw, transfer';
END $$;