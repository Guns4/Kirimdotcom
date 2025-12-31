-- Create user consents tracking table
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    document_type TEXT NOT NULL, -- 'TOS', 'PRIVACY_POLICY', 'AUP'
    document_version TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    consent_hash TEXT NOT NULL, -- SHA256 of document content at time of consent
    agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_document ON public.user_consents(document_type, document_version);
CREATE INDEX IF NOT EXISTS idx_user_consents_agreed_at ON public.user_consents(agreed_at);

-- RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consents" ON public.user_consents FOR SELECT USING (auth.uid() = user_id);

-- Add last_accepted_tos_version to users if not exists (from previous TOS schema)
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_accepted_tos_version TEXT;

COMMENT ON TABLE public.user_consents IS 'Legal tracking of user consent for non-repudiation purposes';
