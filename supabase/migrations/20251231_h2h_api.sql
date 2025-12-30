-- H2H API Schema
-- B2B Partner Integration

-- API Credentials
CREATE TABLE IF NOT EXISTS api_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Auth
    api_key TEXT UNIQUE NOT NULL,
    secret_key TEXT NOT NULL, -- For signature calculation if needed
    
    -- Security
    ip_whitelist TEXT[], -- Array of allowed IPs
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    total_requests INT DEFAULT 0,
    last_request_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- H2H Transaction Logs
CREATE TABLE IF NOT EXISTS h2h_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID REFERENCES api_credentials(id),
    
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_body JSONB,
    response_code INT,
    response_body JSONB,
    ip_address TEXT,
    execution_time_ms INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE h2h_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their api credentials" ON api_credentials
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their logs" ON h2h_request_logs
FOR SELECT USING (credential_id IN (SELECT id FROM api_credentials WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_api_credentials_key ON api_credentials(api_key);
CREATE INDEX idx_h2h_logs_creds ON h2h_request_logs(credential_id, created_at DESC);
