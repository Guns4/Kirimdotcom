CREATE TABLE IF NOT EXISTS public.suspicious_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.suspicious_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view key logs
CREATE POLICY "Admins can view suspicious logs" ON public.suspicious_activity_logs
    FOR SELECT TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@cekkirim.com')); -- Simple admin check or use role
