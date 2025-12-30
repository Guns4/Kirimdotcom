-- Table to store validated bank accounts
CREATE TABLE IF NOT EXISTS public.saved_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    bank_code TEXT NOT NULL,       -- e.g. 'BCA', 'MANDIRI'
    account_number TEXT NOT NULL,
    account_holder_name TEXT NOT NULL, -- The name returned by API
    
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate accounts for same user
    CONSTRAINT unique_user_account UNIQUE (user_id, bank_code, account_number)
);

-- RLS
ALTER TABLE public.saved_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own accounts" ON public.saved_bank_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users delete own accounts" ON public.saved_bank_accounts
FOR DELETE USING (auth.uid() = user_id);

-- Insert strictly controlled via Server Action/API (No direct INSERT policy for now)
