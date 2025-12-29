-- API Keys Table (Secure Storage)
CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    key_hash text NOT NULL, -- SHA-256 Hash of the key
    key_prefix text NOT NULL, -- First 7 chars (e.g. ck_live_)
    label text, -- e.g. "Production App"
    is_active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups (optional but good practice)
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own keys (but they can't see the full key, only hash/prefix)
CREATE POLICY "Users can view own keys" ON public.api_keys
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can delete/revoke own keys
CREATE POLICY "Users can revoke own keys" ON public.api_keys
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
    
-- Update policy (soft delete/revoke)
CREATE POLICY "Users can update own keys" ON public.api_keys
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
