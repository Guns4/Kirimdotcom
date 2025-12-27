CREATE TABLE IF NOT EXISTS authenticators (
    credentialID TEXT PRIMARY KEY,
    credentialPublicKey TEXT NOT NULL,
    counter BIGINT NOT NULL,
    credentialDeviceType TEXT NOT NULL,
    credentialBackedUp BOOLEAN NOT NULL,
    transports TEXT [],
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_authenticators_user_id ON authenticators(user_id);
ALTER TABLE authenticators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own authenticators" ON authenticators FOR ALL USING (auth.uid() = user_id);