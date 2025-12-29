-- ============================================================================
-- API Keys Schema (Phase 118)
-- Secure API Key Management for Developer Dashboard
-- ============================================================================

-- API Keys Table (Secure Storage)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    key_hash text NOT NULL UNIQUE, -- SHA-256 Hash of the key
    key_prefix text NOT NULL, -- First 7-12 chars (e.g. ck_live_abc...)
    label text, -- e.g. "Production App"
    is_active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can revoke own keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create own keys" ON public.api_keys;
DROP POLICY IF EXISTS "Service role full access" ON public.api_keys;

-- RLS Policies
-- Users can see their own keys (but they can't see the full key, only hash/prefix)
CREATE POLICY "Users can view own keys" 
ON public.api_keys
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own keys
CREATE POLICY "Users can create own keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete/revoke own keys
CREATE POLICY "Users can revoke own keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update policy (soft delete/revoke)
CREATE POLICY "Users can update own keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access"
ON public.api_keys
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.api_keys IS 'Secure storage for API keys (hashed)';
COMMENT ON COLUMN public.api_keys.key_hash IS 'SHA-256 hash of the actual API key';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'Visible prefix for identification (e.g., ck_live_abc...)';
