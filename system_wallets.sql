-- ============================================================================
-- 1. MODIFY WALLETS: Support System Accounts (No User ID)
-- ============================================================================
-- Allow wallets to exist without a user (System Wallets)
DO $$ 
BEGIN
    ALTER TABLE public.wallets ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Add Slug for Fixed Identification (e.g., 'WALLET_SYSTEM_REVENUE')
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 2. MODIFY LEDGER: Enhanced Tracking
-- ============================================================================
-- Add destination tracking for transfers
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS destination_wallet_id UUID REFERENCES public.wallets(id);

-- ============================================================================
-- 3. SEED SYSTEM WALLETS
-- ============================================================================
INSERT INTO public.wallets (slug, is_system, balance, created_at, updated_at)
VALUES 
  ('WALLET_SYSTEM_REVENUE', TRUE, 0.0000, NOW(), NOW()),
  ('WALLET_OPERATIONAL', TRUE, 0.0000, NOW(), NOW()),
  ('WALLET_TAX_RESERVE', TRUE, 0.0000, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 4. SECURITY: Prevent Withdrawals from System Wallets
-- ============================================================================
-- We can enforce this via RLS or inside the withdrawal function.
-- Here is an RLS policy ensuring only Admins/Server can touch these.

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System Wallets Read-Only for Public" ON public.wallets
FOR SELECT USING (
  -- Users see their own, OR it's a system wallet (maybe needed for transparency, otherwise restrict)
  (auth.uid() = user_id) OR (is_system = TRUE AND auth.role() = 'service_role')
);

-- NOTE: Direct updates are already blocked by Ledger System trigger.


CREATE OR REPLACE FUNCTION get_system_wallet_id(p_slug TEXT) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.wallets WHERE slug = p_slug;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
