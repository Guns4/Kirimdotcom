-- Create table for COD Disputes
CREATE TABLE IF NOT EXISTS public.cod_disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_hash TEXT NOT NULL,
    reason TEXT NOT NULL,
    proof_url TEXT,
    -- URL to uploaded image/document
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    otp_verified BOOLEAN DEFAULT FALSE,
    -- To ensure they own the number
    contact_info TEXT,
    -- Email or alternate phone for notification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Index for phone hash lookup
CREATE INDEX IF NOT EXISTS idx_cod_disputes_phone ON public.cod_disputes(phone_hash);
-- Enable RLS
ALTER TABLE public.cod_disputes ENABLE ROW LEVEL SECURITY;
-- Allow public insert (with OTP verification check ideally on server side)
CREATE POLICY "Allow public insert disputes" ON public.cod_disputes FOR
INSERT WITH CHECK (true);
-- Allow admins (service role) to read and update
-- For now, we rely on server actions usage of service role for admin ops.
-- But if we have authenticated admin users via Supabase Auth, we can add:
-- CREATE POLICY "Allow admins all" ON public.cod_disputes TO authenticated USING (auth.role() = 'service_role');