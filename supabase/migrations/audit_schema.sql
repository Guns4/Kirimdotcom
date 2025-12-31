-- Audit Schema
-- Financial Reconciliation Logs

CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_requests INTEGER DEFAULT 0,
    total_billed_transactions INTEGER DEFAULT 0,
    discrepancy_count INTEGER DEFAULT 0,
    discrepancy_details JSONB, -- List of mismatched request IDs or user IDs
    status TEXT NOT NULL, -- 'MATCH', 'MISMATCH', 'ERROR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for date lookups
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.financial_audit_logs(audit_date);

-- RLS
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins or Service Role only
CREATE POLICY "Service role manages audits" ON public.financial_audit_logs FOR ALL USING (true);
