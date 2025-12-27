-- =============================================================================
-- SECURITY & AUDIT SYSTEM
-- Phase 446-450: Security Hardening & Stability
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. AUDIT LOGS TABLE (Comprehensive Activity Tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Who
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    -- What
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    -- Details
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    -- Where
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(2),
    -- Additional context
    request_id VARCHAR(100),
    session_id VARCHAR(100),
    -- Severity
    severity VARCHAR(20) DEFAULT 'info',
    -- 'info', 'warning', 'critical'
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON public.audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON public.audit_logs(severity);
-- =============================================================================
-- 2. RATE LIMIT TRACKING TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identifier (IP or user_id)
    identifier VARCHAR(100) NOT NULL,
    identifier_type VARCHAR(20) NOT NULL,
    -- 'ip', 'user', 'api_key'
    -- Endpoint
    endpoint VARCHAR(255) NOT NULL,
    -- Counters
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    -- Limits
    max_requests INTEGER DEFAULT 100,
    window_seconds INTEGER DEFAULT 60,
    -- Status
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMPTZ,
    -- Metadata
    last_request_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, endpoint)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_id ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked ON public.rate_limits(is_blocked);
-- =============================================================================
-- 3. SECURITY EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Event type
    event_type VARCHAR(50) NOT NULL,
    -- 'login_failed', 'rate_limited', 'suspicious_activity', 'sql_injection_attempt'
    -- Source
    ip_address VARCHAR(45) NOT NULL,
    user_id UUID,
    -- Details
    description TEXT,
    raw_data JSONB,
    -- Action taken
    action_taken VARCHAR(100),
    -- Severity
    severity VARCHAR(20) NOT NULL,
    -- 'low', 'medium', 'high', 'critical'
    -- Status
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_ip ON public.security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_unresolved ON public.security_events(is_resolved);
-- =============================================================================
-- 4. BACKUP LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Backup info
    backup_type VARCHAR(50) NOT NULL,
    -- 'database', 'storage', 'full'
    backup_size_bytes BIGINT,
    -- Location
    storage_path TEXT,
    download_url TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'running', 'completed', 'failed'
    error_message TEXT,
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    -- Notification
    notification_sent BOOLEAN DEFAULT false,
    notified_email VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_backup_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_date ON public.backup_logs(started_at DESC);
-- =============================================================================
-- 5. FUNCTION: Log Audit Event
-- =============================================================================
CREATE OR REPLACE FUNCTION log_audit(
        p_user_id UUID,
        p_action VARCHAR,
        p_resource_type VARCHAR DEFAULT NULL,
        p_resource_id UUID DEFAULT NULL,
        p_description TEXT DEFAULT NULL,
        p_old_values JSONB DEFAULT NULL,
        p_new_values JSONB DEFAULT NULL,
        p_ip_address VARCHAR DEFAULT NULL,
        p_severity VARCHAR DEFAULT 'info'
    ) RETURNS UUID AS $$
DECLARE v_log_id UUID;
v_email VARCHAR;
v_role VARCHAR;
BEGIN -- Get user info if available
IF p_user_id IS NOT NULL THEN
SELECT email INTO v_email
FROM auth.users
WHERE id = p_user_id;
SELECT role INTO v_role
FROM public.profiles
WHERE id = p_user_id;
END IF;
INSERT INTO public.audit_logs (
        user_id,
        user_email,
        user_role,
        action,
        resource_type,
        resource_id,
        description,
        old_values,
        new_values,
        ip_address,
        severity
    )
VALUES (
        p_user_id,
        v_email,
        v_role,
        p_action,
        p_resource_type,
        p_resource_id,
        p_description,
        p_old_values,
        p_new_values,
        p_ip_address,
        p_severity
    )
RETURNING id INTO v_log_id;
RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================================================
-- 6. FUNCTION: Check Rate Limit
-- =============================================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
        p_identifier VARCHAR,
        p_identifier_type VARCHAR,
        p_endpoint VARCHAR,
        p_max_requests INTEGER DEFAULT 100,
        p_window_seconds INTEGER DEFAULT 60
    ) RETURNS TABLE(
        is_allowed BOOLEAN,
        current_count INTEGER,
        remaining INTEGER,
        reset_at TIMESTAMPTZ
    ) AS $$
DECLARE v_record RECORD;
v_now TIMESTAMPTZ := NOW();
v_window_start TIMESTAMPTZ;
BEGIN -- Calculate window start
v_window_start := v_now - (p_window_seconds || ' seconds')::INTERVAL;
-- Get or create rate limit record
SELECT * INTO v_record
FROM public.rate_limits
WHERE identifier = p_identifier
    AND endpoint = p_endpoint;
IF NOT FOUND THEN -- First request
INSERT INTO public.rate_limits (
        identifier,
        identifier_type,
        endpoint,
        request_count,
        window_start,
        max_requests,
        window_seconds
    )
VALUES (
        p_identifier,
        p_identifier_type,
        p_endpoint,
        1,
        v_now,
        p_max_requests,
        p_window_seconds
    );
RETURN QUERY
SELECT true,
    1,
    p_max_requests - 1,
    v_now + (p_window_seconds || ' seconds')::INTERVAL;
RETURN;
END IF;
-- Check if blocked
IF v_record.is_blocked
AND v_record.blocked_until > v_now THEN RETURN QUERY
SELECT false,
    v_record.request_count,
    0,
    v_record.blocked_until;
RETURN;
END IF;
-- Check if window expired
IF v_record.window_start < v_window_start THEN -- Reset window
UPDATE public.rate_limits
SET request_count = 1,
    window_start = v_now,
    is_blocked = false,
    blocked_until = NULL,
    last_request_at = v_now
WHERE identifier = p_identifier
    AND endpoint = p_endpoint;
RETURN QUERY
SELECT true,
    1,
    p_max_requests - 1,
    v_now + (p_window_seconds || ' seconds')::INTERVAL;
RETURN;
END IF;
-- Increment counter
IF v_record.request_count >= p_max_requests THEN -- Rate limited!
UPDATE public.rate_limits
SET is_blocked = true,
    blocked_until = v_now + (p_window_seconds * 2 || ' seconds')::INTERVAL
WHERE identifier = p_identifier
    AND endpoint = p_endpoint;
-- Log security event
INSERT INTO public.security_events (
        event_type,
        ip_address,
        description,
        severity
    )
VALUES (
        'rate_limited',
        p_identifier,
        'Rate limit exceeded on ' || p_endpoint,
        'medium'
    );
RETURN QUERY
SELECT false,
    v_record.request_count,
    0,
    v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL;
RETURN;
END IF;
-- Allow and increment
UPDATE public.rate_limits
SET request_count = request_count + 1,
    last_request_at = v_now
WHERE identifier = p_identifier
    AND endpoint = p_endpoint;
RETURN QUERY
SELECT true,
    v_record.request_count + 1,
    p_max_requests - v_record.request_count - 1,
    v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. FUNCTION: Log Security Event
-- =============================================================================
CREATE OR REPLACE FUNCTION log_security_event(
        p_event_type VARCHAR,
        p_ip_address VARCHAR,
        p_description TEXT DEFAULT NULL,
        p_severity VARCHAR DEFAULT 'medium',
        p_raw_data JSONB DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_event_id UUID;
BEGIN
INSERT INTO public.security_events (
        event_type,
        ip_address,
        description,
        severity,
        raw_data
    )
VALUES (
        p_event_type,
        p_ip_address,
        p_description,
        p_severity,
        p_raw_data
    )
RETURNING id INTO v_event_id;
RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================================================
-- 8. RLS POLICIES
-- =============================================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view security events" ON public.security_events FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Security Hardening System created!';
RAISE NOTICE '🛡️ Rate limiting enabled (100 req/min)';
RAISE NOTICE '📝 Comprehensive audit logging';
RAISE NOTICE '🚨 Security event tracking';
RAISE NOTICE '💾 Backup logging ready';
END $$;