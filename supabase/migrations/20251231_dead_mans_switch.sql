-- Dead Man's Switch Configuration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS dead_mans_switch_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trustee_email TEXT NOT NULL,
    emergency_info TEXT, -- Encrypted string containing vault access or similar
    last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, WARNING_SENT, TRIGGERED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Policy (RLS)
ALTER TABLE dead_mans_switch_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own config"
ON dead_mans_switch_config FOR ALL
USING (auth.uid() = user_id);
