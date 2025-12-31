-- ==========================================
-- DIVISI 3: FINTECH & WALLET SYSTEM
-- Payment Gateway, Topup, Withdraw, Security
-- ==========================================
-- ==========================================
-- TABLE: wallet_topups
-- Tracks all topup transactions via Midtrans
-- ==========================================
CREATE TABLE IF NOT EXISTS public.wallet_topups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trx_id VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 10000),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED')
    ),
    payment_type VARCHAR(50),
    payment_url TEXT,
    snap_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for topups
CREATE INDEX IF NOT EXISTS idx_wallet_topups_user_id ON public.wallet_topups(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_topups_status ON public.wallet_topups(status);
CREATE INDEX IF NOT EXISTS idx_wallet_topups_trx_id ON public.wallet_topups(trx_id);
-- ==========================================
-- TABLE: wallet_withdrawals
-- Tracks withdrawal requests (manual approval)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.wallet_withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trx_id VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 50000),
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for withdrawals
CREATE INDEX IF NOT EXISTS idx_wallet_withdrawals_user_id ON public.wallet_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_withdrawals_status ON public.wallet_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_wallet_withdrawals_trx_id ON public.wallet_withdrawals(trx_id);
-- ==========================================
-- USER SECURITY FIELDS
-- PIN and anti-brute force protection
-- ==========================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS transaction_pin VARCHAR(255),
    ADD COLUMN IF NOT EXISTS failed_pin_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMP WITH TIME ZONE;
-- Index for security checks
CREATE INDEX IF NOT EXISTS idx_users_pin_lock ON public.users(pin_locked_until)
WHERE pin_locked_until IS NOT NULL;
-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Topups RLS
ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own topups" ON public.wallet_topups;
CREATE POLICY "Users view own topups" ON public.wallet_topups FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role full access topups" ON public.wallet_topups;
CREATE POLICY "Service role full access topups" ON public.wallet_topups USING (auth.role() = 'service_role');
-- Withdrawals RLS
ALTER TABLE public.wallet_withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own withdrawals" ON public.wallet_withdrawals;
CREATE POLICY "Users view own withdrawals" ON public.wallet_withdrawals FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role full access withdrawals" ON public.wallet_withdrawals;
CREATE POLICY "Service role full access withdrawals" ON public.wallet_withdrawals USING (auth.role() = 'service_role');
-- ==========================================
-- COMMENTS
-- ==========================================
COMMENT ON TABLE public.wallet_topups IS 'Payment gateway topup transactions via Midtrans';
COMMENT ON TABLE public.wallet_withdrawals IS 'User withdrawal requests requiring admin approval';
COMMENT ON COLUMN public.users.transaction_pin IS 'Hashed PIN for secure transactions (6 digits)';
COMMENT ON COLUMN public.users.failed_pin_attempts IS 'Counter for failed PIN attempts (max 3)';
COMMENT ON COLUMN public.users.pin_locked_until IS 'Timestamp until account is locked after 3 failed attempts';
-- ==========================================
-- Migration Complete ✅
-- ==========================================