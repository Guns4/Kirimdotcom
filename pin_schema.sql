-- Table for Security Settings (PIN, Lockout)
CREATE TABLE IF NOT EXISTS public.user_security (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    transaction_pin_hash TEXT, -- Hashed PIN
    
    pin_attempts INTEGER DEFAULT 0,
    pin_locked_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own security" ON public.user_security
FOR SELECT USING (auth.uid() = user_id);

-- Only Server Actions update this table to enforce Lockout Logic
