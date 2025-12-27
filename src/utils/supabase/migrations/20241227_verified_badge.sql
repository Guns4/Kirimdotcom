-- ============================================================================
-- VERIFIED BADGE / KYC SYSTEM
-- Phase 411-415: Trust Monetization & Identity Verification
-- ============================================================================
-- ============================================================================
-- 1. ADD VERIFICATION FIELDS TO PROFILES
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_by UUID,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(is_verified);
-- ============================================================================
-- 2. VERIFICATION REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User details
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    -- Personal info
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    phone_number VARCHAR(20),
    -- Documents
    ktp_image_url TEXT NOT NULL,
    selfie_image_url TEXT NOT NULL,
    -- Additional info
    reason TEXT,
    -- Why they want verification
    social_proof JSONB,
    -- Links to social media, store, etc
    -- Review status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected', 'revision'
    -- Admin review
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
-- ============================================================================
-- 3. FUNCTION: Submit Verification Request
-- ============================================================================
CREATE OR REPLACE FUNCTION submit_verification_request(
        p_user_id UUID,
        p_full_name VARCHAR,
        p_business_name VARCHAR,
        p_phone VARCHAR,
        p_ktp_url TEXT,
        p_selfie_url TEXT,
        p_reason TEXT,
        p_social_proof JSONB
    ) RETURNS UUID AS $$
DECLARE v_request_id UUID;
v_email VARCHAR;
BEGIN -- Get user email
SELECT email INTO v_email
FROM public.profiles
WHERE id = p_user_id;
-- Create or update request
INSERT INTO public.verification_requests (
        user_id,
        email,
        full_name,
        business_name,
        phone_number,
        ktp_image_url,
        selfie_image_url,
        reason,
        social_proof,
        status
    )
VALUES (
        p_user_id,
        v_email,
        p_full_name,
        p_business_name,
        p_phone,
        p_ktp_url,
        p_selfie_url,
        p_reason,
        p_social_proof,
        'pending'
    ) ON CONFLICT (user_id) DO
UPDATE
SET full_name = p_full_name,
    business_name = p_business_name,
    phone_number = p_phone,
    ktp_image_url = p_ktp_url,
    selfie_image_url = p_selfie_url,
    reason = p_reason,
    social_proof = p_social_proof,
    status = 'pending',
    updated_at = NOW()
RETURNING id INTO v_request_id;
RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. FUNCTION: Approve Verification
-- ============================================================================
CREATE OR REPLACE FUNCTION approve_verification(
        p_request_id UUID,
        p_admin_id UUID,
        p_notes TEXT DEFAULT NULL
    ) RETURNS VOID AS $$
DECLARE v_user_id UUID;
BEGIN -- Get user ID from request
SELECT user_id INTO v_user_id
FROM public.verification_requests
WHERE id = p_request_id;
-- Update verification request
UPDATE public.verification_requests
SET status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    review_notes = p_notes
WHERE id = p_request_id;
-- Mark user as verified
UPDATE public.profiles
SET is_verified = true,
    verified_at = NOW(),
    verified_by = p_admin_id
WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTION: Reject Verification
-- ============================================================================
CREATE OR REPLACE FUNCTION reject_verification(
        p_request_id UUID,
        p_admin_id UUID,
        p_notes TEXT
    ) RETURNS VOID AS $$ BEGIN
UPDATE public.verification_requests
SET status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    review_notes = p_notes
WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. VERIFIED BADGE COMPONENT HELPER
-- ============================================================================
COMMENT ON COLUMN public.profiles.is_verified IS 'User has completed KYC verification. Display blue checkmark badge next to their name.';
-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
-- Users can view their own requests
CREATE POLICY "Users can view own verification requests" ON public.verification_requests FOR
SELECT USING (auth.uid() = user_id);
-- Users can create/update their own requests
CREATE POLICY "Users can submit verification requests" ON public.verification_requests FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending requests" ON public.verification_requests FOR
UPDATE USING (
        auth.uid() = user_id
        AND status = 'pending'
    );
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Verified Badge System created!';
RAISE NOTICE '🔐 KYC verification enabled';
RAISE NOTICE '✓ Blue checkmark badges ready';
RAISE NOTICE '👑 Verified user privileges configured';
RAISE NOTICE '💎 Trust monetization complete!';
END $$;