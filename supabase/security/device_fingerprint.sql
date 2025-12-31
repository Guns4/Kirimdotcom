-- Table to store valid devices for each user
CREATE TABLE IF NOT EXISTS public.known_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_known_devices_user_hash ON public.known_devices(user_id, device_hash);

-- RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.known_devices 
    FOR SELECT USING (auth.uid() = user_id);

-- Only server logic should insert/update usually, or strictly validated client input
-- For MVP, we allow insert if user owns it
CREATE POLICY "Users can add devices" ON public.known_devices 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
