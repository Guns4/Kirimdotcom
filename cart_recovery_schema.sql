-- Ensure transactions table exists
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'PENDING',
    contact_phone TEXT,
    customer_name TEXT,
    amount DECIMAL(19,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add recovery tracking column
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS recovery_sent_at TIMESTAMP WITH TIME ZONE;

-- Index for fast Cron Job queries
CREATE INDEX IF NOT EXISTS idx_transactions_abandoned 
ON public.transactions(status, created_at) 
WHERE status = 'PENDING' AND recovery_sent_at IS NULL;

-- Recovery log table
CREATE TABLE IF NOT EXISTS public.cart_recovery_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    channel TEXT DEFAULT 'whatsapp',
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_recovery_logs_transaction 
ON public.cart_recovery_logs(transaction_id);
