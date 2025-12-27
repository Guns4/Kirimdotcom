-- =============================================
-- SYSTEM AUDIT & OPTIMIZATION: SECURITY & PERFORMANCE
-- Date: 2024-12-27
-- =============================================
-- 1. DATABASE INTEGRITY: FOREIGN KEYS
-- Ensure 'search_history' links to 'auth.users'
-- We use a DO block to prevent errors if the constraint already exists
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_search_history_user'
) THEN
ALTER TABLE public.search_history
ADD CONSTRAINT fk_search_history_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
END $$;
-- 2. INDEXING: MISSING INDEXES
-- Found missing index on 'buyer_reports' for phone_hash lookups
CREATE INDEX IF NOT EXISTS idx_buyer_reports_phone ON public.buyer_reports(phone_hash);
-- Found missing index on 'cod_disputes' for date-based filtering (Admin Dashboard)
CREATE INDEX IF NOT EXISTS idx_cod_disputes_created_at ON public.cod_disputes(created_at DESC);
-- Verify existance of other critical indexes (Idempotent)
CREATE INDEX IF NOT EXISTS idx_cod_risk_postal ON public.cod_risk_zones(postal_code);
CREATE INDEX IF NOT EXISTS idx_cod_disputes_phone ON public.cod_disputes(phone_hash);
-- 3. RLS POLICY REVIEW (Comments & Adjustments)
-- Table: cod_risk_zones
-- Status: Public Read (Safe for checking risk). Updates restricted to Admin/Service Role implicitly.
-- Table: cod_disputes
-- Status: Public Insert with CHECK(true).
-- Risk: Spam inserts.
-- Mitigation: Client-side Captcha (Turnstile) + Server-side validation logic recommended.
-- Action: Ensure policy exists (Idempotent) via checks, but we won't alter logic for now to avoid breaking guest submissions.
-- Table: reported_buyers
-- Status: Public Read (Privacy preserved via Hash). Safe.
-- Table: buyer_reports
-- Status: Public Insert.
-- Action: Added Index on phone_hash above to speed up audits.
-- End of Audit Script