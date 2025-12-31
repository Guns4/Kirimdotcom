-- Legal Tracking Schema
-- Non-repudiation consent tracking

CREATE TABLE IF NOT EXISTS public.legal_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    document_type TEXT NOT NULL, -- 'TOS', 'PRIVACY', 'REFUND'
    document_version TEXT NOT NULL, -- 'v1.0', '2025-12-31'
    document_hash TEXT NOT NULL, -- SHA-256 hash of the content agreed to
    ip_address TEXT, -- Stored as text to handle IPv4/IPv6 mapped
    user_agent TEXT,
    agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint to prevent duplicate active consents if needed, 
    -- but usually we want a log of everytime they agree (e.g. re-login or checkout)
    -- For now, just a log.
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Index for fast lookup of latest consent
CREATE INDEX IF NOT EXISTS idx_legal_consents_user_doc ON public.legal_consents(user_id, document_type, document_version);

-- RLS
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users view own consents" ON public.legal_consents 
    FOR SELECT USING (auth.uid() = user_id);

-- System (Service Role) inserts consents. 
-- Users might insert via server action (authenticated).
CREATE POLICY "Users insert own consents" ON public.legal_consents 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No updates/deletes allowed for non-repudiation (Immutable log)
