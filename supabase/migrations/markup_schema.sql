CREATE TABLE IF NOT EXISTS public.markup_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_level TEXT DEFAULT 'ALL_USERS', -- ALL_USERS, NEW_USER, VIP
    courier TEXT, -- JNE, SICEPAT, or ALL
    amount_rp NUMERIC DEFAULT 0,
    amount_percent NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Initial Rules
INSERT INTO public.markup_rules (user_level, courier, amount_rp) VALUES 
('ALL_USERS', 'ALL', 200); -- Global Profit
