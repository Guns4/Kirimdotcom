-- ============================================
-- API KEYS SCHEMA FOR B2B API
-- ============================================
-- Run this in Supabase SQL Editor
-- Table for API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    -- SHA-256 hash of the API key
    key_prefix VARCHAR(8) NOT NULL,
    -- First 8 chars for display (ck_live_xxxx)
    -- Usage tracking
    requests_count INTEGER DEFAULT 0,
    requests_limit INTEGER DEFAULT 1000,
    -- Monthly limit
    last_used_at TIMESTAMP WITH TIME ZONE,
    -- Permissions
    scopes TEXT [] DEFAULT ARRAY ['track:read', 'ongkir:read'],
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active)
WHERE is_active = TRUE;
-- Table for API request logs
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_date ON api_request_logs(created_at);
-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
-- Users can view their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys FOR
SELECT USING (auth.uid() = user_id);
-- Users can create their own API keys
CREATE POLICY "Users can create API keys" ON api_keys FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own API keys  
CREATE POLICY "Users can update own API keys" ON api_keys FOR
UPDATE USING (auth.uid() = user_id);
-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);
-- Users can view logs for their own API keys
CREATE POLICY "Users can view own API logs" ON api_request_logs FOR
SELECT USING (
        api_key_id IN (
            SELECT id
            FROM api_keys
            WHERE user_id = auth.uid()
        )
    );
-- Function to validate API key and increment usage
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash VARCHAR) RETURNS TABLE(
        key_id UUID,
        user_id UUID,
        is_valid BOOLEAN,
        error_message TEXT,
        requests_remaining INTEGER
    ) AS $$
DECLARE v_key api_keys %ROWTYPE;
BEGIN -- Find the key
SELECT * INTO v_key
FROM api_keys
WHERE key_hash = p_key_hash
    AND is_active = TRUE;
IF NOT FOUND THEN RETURN QUERY
SELECT NULL::UUID,
    NULL::UUID,
    FALSE,
    'Invalid API key'::TEXT,
    0;
RETURN;
END IF;
-- Check expiration
IF v_key.expires_at IS NOT NULL
AND v_key.expires_at < NOW() THEN RETURN QUERY
SELECT v_key.id,
    v_key.user_id,
    FALSE,
    'API key expired'::TEXT,
    0;
RETURN;
END IF;
-- Check quota
IF v_key.requests_count >= v_key.requests_limit THEN RETURN QUERY
SELECT v_key.id,
    v_key.user_id,
    FALSE,
    'Monthly quota exceeded'::TEXT,
    0;
RETURN;
END IF;
-- Increment usage
UPDATE api_keys
SET requests_count = requests_count + 1,
    last_used_at = NOW()
WHERE id = v_key.id;
RETURN QUERY
SELECT v_key.id,
    v_key.user_id,
    TRUE,
    NULL::TEXT,
    v_key.requests_limit - v_key.requests_count - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to reset monthly quotas (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_api_quotas() RETURNS void AS $$ BEGIN
UPDATE api_keys
SET requests_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;