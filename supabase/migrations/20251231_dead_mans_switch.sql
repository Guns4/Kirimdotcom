-- Create table for Dead Man's Switch Configuration
CREATE TABLE IF NOT EXISTS public.dead_mans_switch_config (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure singleton
    enabled BOOLEAN DEFAULT false,
    check_in_interval INTERVAL DEFAULT '7 days',
    last_heartbeat_at TIMESTAMPTZ DEFAULT now(),
    notification_emails TEXT[] DEFAULT '{}',
    trigger_actions JSONB DEFAULT '{}', -- Store actions to take (e.g., release_repo, transfer_ownership)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dead_mans_switch_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (adjust usage string based on your authsetup)
CREATE POLICY "Admins can view and update DMS config"
    ON public.dead_mans_switch_config
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Initialize with default disabled config
INSERT INTO public.dead_mans_switch_config (id, enabled, check_in_interval)
VALUES (1, false, '7 days')
ON CONFLICT (id) DO NOTHING;

-- Create logs table
CREATE TABLE IF NOT EXISTS public.dead_mans_switch_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'HEARTBEAT', 'WARNING', 'TRIGGERED', 'CONFIG_CHANGE'
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dead_mans_switch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view DMS logs"
    ON public.dead_mans_switch_logs
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Grant permissions if needed (usually handled by default roles in Supabase)
GRANT ALL ON public.dead_mans_switch_config TO service_role;
GRANT ALL ON public.dead_mans_switch_logs TO service_role;
