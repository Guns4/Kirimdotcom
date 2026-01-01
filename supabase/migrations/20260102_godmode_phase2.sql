-- TABEL SYSTEM LOGS (For Security Radar)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    -- INFO, WARNING, CRITICAL
    event_type VARCHAR(50) NOT NULL,
    -- LOGIN_FAIL, API_ABUSE, BRUTE_FORCE
    message TEXT,
    ip_address VARCHAR(50),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Index for fast log retrieval
CREATE INDEX IF NOT EXISTS idx_logs_created ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.system_logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON public.system_logs (event_type);
-- USER STATUS COLUMNS (Banned/Active)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS ban_reason TEXT,
    ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50),
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
-- Insert some sample logs for testing
INSERT INTO public.system_logs (level, event_type, message, ip_address)
VALUES (
        'WARNING',
        'BRUTE_FORCE',
        'Failed PIN attempt 5x',
        '192.168.1.55'
    ),
    (
        'CRITICAL',
        'SQL_INJECTION',
        'Payload detected: OR 1=1',
        '45.22.11.90'
    ),
    (
        'WARNING',
        'API_ABUSE',
        'Rate limit exceeded (200 req/s)',
        '103.44.22.1'
    ),
    (
        'INFO',
        'USER_LOGIN',
        'Successful login',
        '110.5.6.7'
    );
COMMENT ON TABLE public.system_logs IS 'Real-time security and system event logging for God Mode dashboard';
COMMENT ON COLUMN public.users.is_banned IS 'Admin-controlled ban flag for user account suspension';