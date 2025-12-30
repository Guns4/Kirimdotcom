-- 1. Consent Logs (To track T&C acceptance)
CREATE TABLE IF NOT EXISTS public.privacy_consent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agreement_version TEXT NOT NULL, -- e.g. 'v1.0', '2025-01-01'
    ip_address TEXT,
    user_agent TEXT,
    agreed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON public.privacy_consent_logs(user_id);

-- 2. Anonymization Function (Right to be Forgotten)
-- Updates transaction history to remove personal identifiers before account deletion
CREATE OR REPLACE FUNCTION public.anonymize_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Anonymize Transactions (if table exists)
    UPDATE public.transactions 
    SET 
        description = 'User Account Deleted'
    WHERE user_id = p_user_id
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions');

    -- Anonymize Profiles (if table exists)
    UPDATE public.profiles
    SET 
        full_name = 'Deleted User',
        phone = NULL,
        avatar_url = NULL,
        metadata = '{}'::jsonb
    WHERE id = p_user_id
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles');

    -- Anonymize Point History (if table exists)
    UPDATE public.point_history
    SET 
        description = 'Historical Activity - User Deleted'
    WHERE user_id = p_user_id
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_history');

    -- Note: Add more table anonymizations as needed
    -- Keep financial records for compliance but scrub PII
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.privacy_consent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consents" ON public.privacy_consent_logs;
CREATE POLICY "Users can view own consents" ON public.privacy_consent_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consents" ON public.privacy_consent_logs;
CREATE POLICY "Users can insert own consents" ON public.privacy_consent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
