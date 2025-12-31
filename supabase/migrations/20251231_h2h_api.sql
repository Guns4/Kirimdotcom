-- H2H API Schema
-- Phase 1756-1760

-- 1. H2H Partners Table (Credential & Security)
CREATE TABLE IF NOT EXISTS public.h2h_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    ip_whitelist INET[] DEFAULT NULL, -- Array of allowed IPs, NULL means allow all (or strictly no access if enforced)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast API Key lookup
CREATE INDEX IF NOT EXISTS idx_h2h_partners_api_key ON public.h2h_partners(api_key);

-- 2. H2H Transaction Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.h2h_transaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES public.h2h_partners(id),
    ref_id TEXT, -- Partner's Reference ID
    trx_id TEXT, -- Our Internal ID
    endpoint TEXT,
    request_payload JSONB,
    response_payload JSONB,
    status_code INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_h2h_logs_ref_id ON public.h2h_transaction_logs(ref_id);
CREATE INDEX IF NOT EXISTS idx_h2h_logs_trx_id ON public.h2h_transaction_logs(trx_id);

-- 3. RLS
ALTER TABLE public.h2h_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.h2h_transaction_logs ENABLE ROW LEVEL SECURITY;

-- Service role management
CREATE POLICY "Service role manages h2h" ON public.h2h_partners FOR ALL USING (true);
CREATE POLICY "Service role manages h2h logs" ON public.h2h_transaction_logs FOR ALL USING (true);
