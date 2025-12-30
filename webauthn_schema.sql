-- Table: User Authenticators (for WebAuthn/Passkeys)
CREATE TABLE IF NOT EXISTS public.user_authenticators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    credential_public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    transports TEXT[], -- ['usb', 'ble', 'nfc', 'internal']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_authenticators_user ON public.user_authenticators(user_id);

-- RLS
ALTER TABLE user_authenticators ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can manage their own authenticators" ON user_authenticators
        FOR ALL TO authenticated
        USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
