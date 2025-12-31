-- Create Tycoon Profiles Table
CREATE TABLE IF NOT EXISTS public.tycoon_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    warehouse_name VARCHAR DEFAULT 'Garasi Rumah',
    truck_skin VARCHAR DEFAULT 'default',
    unlocks JSONB DEFAULT '[]'::jsonb, -- Array of strings e.g. ['skin_blue', 'discount_5']
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.tycoon_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tycoon profile" ON public.tycoon_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tycoon profile" ON public.tycoon_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tycoon profiles" ON public.tycoon_profiles
    FOR ALL USING (true) WITH CHECK (true);


-- Create Tycoon Logs (XP History)
CREATE TABLE IF NOT EXISTS public.tycoon_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    source VARCHAR NOT NULL, -- 'shipment', 'login', 'referral'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tycoon_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.tycoon_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Trigger to create profile on user signup could be added here or handled via app logic
-- For now, we assume lazy creation or separate init
