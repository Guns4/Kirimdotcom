-- Ensure table exists (from previous step)
CREATE TABLE IF NOT EXISTS public.known_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    latitude FLOAT,   -- NEW
    longitude FLOAT,  -- NEW
    country_code TEXT, -- NEW
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_known_devices_user_hash ON public.known_devices(user_id, device_hash);

-- RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.known_devices FOR SELECT USING (auth.uid() = user_id);
-- Insert handled by server function/policy
