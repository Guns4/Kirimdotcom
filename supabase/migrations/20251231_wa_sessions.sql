-- WhatsApp Bot Sessions Schema
-- SaaS Multi-tenant WA Bot Server

CREATE TABLE IF NOT EXISTS wa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    
    -- Connection Info
    phone_number TEXT,
    device_name TEXT,
    platform TEXT,
    
    -- Status
    status TEXT DEFAULT 'DISCONNECTED', -- DISCONNECTED, CONNECTING, CONNECTED, QR_READY
    qr_code TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    
    -- Session Data (encrypted)
    session_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Log
CREATE TABLE IF NOT EXISTS wa_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES wa_sessions(session_id) ON DELETE CASCADE,
    
    message_id TEXT NOT NULL,
    direction TEXT NOT NULL, -- INCOMING, OUTGOING
    from_number TEXT,
    to_number TEXT,
    message_type TEXT, -- TEXT, IMAGE, DOCUMENT, etc.
    content TEXT,
    
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, READ, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE wa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WA sessions"
ON wa_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own WA sessions"
ON wa_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their sessions"
ON wa_messages FOR SELECT 
USING (session_id IN (SELECT session_id FROM wa_sessions WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_wa_sessions_user_id ON wa_sessions(user_id);
CREATE INDEX idx_wa_sessions_status ON wa_sessions(status);
CREATE INDEX idx_wa_messages_session_id ON wa_messages(session_id);
CREATE INDEX idx_wa_messages_created_at ON wa_messages(created_at DESC);
