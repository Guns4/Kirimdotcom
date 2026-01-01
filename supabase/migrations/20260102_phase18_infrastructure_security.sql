-- ============================================
-- GOD MODE PHASE 1901-2300: INFRASTRUCTURE & CYBERSECURITY
-- Server Monitoring, UI Customization, 2FA, IP Whitelist, Cyber Defense
-- ============================================
-- ADMIN UI CONFIGURATIONS TABLE (Layout & Theme)
CREATE TABLE IF NOT EXISTS public.admin_ui_configs (
    admin_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    layout_json JSONB DEFAULT '{}',
    -- Widget positions and visibility
    theme_mode VARCHAR(20) DEFAULT 'DARK' CHECK (
        theme_mode IN ('LIGHT', 'DARK', 'HACKER_GREEN', 'BLUE_STEEL')
    ),
    sidebar_collapsed BOOLEAN DEFAULT false,
    favorite_modules TEXT [],
    -- Array of module IDs user pinned
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ADMIN SECURITY SETTINGS TABLE (2FA & IP Whitelist)
CREATE TABLE IF NOT EXISTS public.admin_security_settings (
    admin_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    two_factor_secret VARCHAR(255),
    -- Base32 encoded secret for TOTP
    is_2fa_enabled BOOLEAN DEFAULT false,
    allowed_ips TEXT [],
    -- IP whitelist (NULL = allow all)
    emergency_reset_token VARCHAR(255),
    -- One-time use token for lockout recovery
    last_2fa_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- SECURITY BLOCKED IPS TABLE (Banned IP Addresses)
CREATE TABLE IF NOT EXISTS public.security_blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET UNIQUE NOT NULL,
    reason VARCHAR(50) CHECK (
        reason IN (
            'DDOS',
            'BRUTE_FORCE',
            'HONEYPOT',
            'MANUAL',
            'SQLI',
            'XSS'
        )
    ),
    ban_count INT DEFAULT 1,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    banned_until TIMESTAMP WITH TIME ZONE,
    -- NULL = permanent ban
    notes TEXT
);
-- SERVER HEALTH STATS TABLE (Telemetry)
CREATE TABLE IF NOT EXISTS public.infra_server_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    cpu_usage_percent DECIMAL(5, 2),
    ram_usage_percent DECIMAL(5, 2),
    disk_usage_percent DECIMAL(5, 2),
    active_connections INT,
    response_time_ms INT,
    error_rate_percent DECIMAL(5, 2)
);
-- SECURITY INCIDENTS TABLE (Cyber Attack Logs)
CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    severity VARCHAR(20) CHECK (
        severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    ),
    attack_type VARCHAR(50) CHECK (
        attack_type IN (
            'SQLI',
            'XSS',
            'BRUTE_FORCE',
            'DDOS',
            'CSRF',
            'PATH_TRAVERSAL',
            'HONEYPOT_TRIGGER',
            'OTHER'
        )
    ),
    payload TEXT,
    -- The malicious payload attempted
    ip_source INET,
    endpoint_targeted VARCHAR(255),
    user_agent TEXT,
    mitigation_action VARCHAR(50) CHECK (
        mitigation_action IN ('BLOCKED', 'LOGGED', 'AUTO_BANNED', 'FLAGGED')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ui_configs_admin ON public.admin_ui_configs(admin_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_admin ON public.admin_security_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_2fa ON public.admin_security_settings(is_2fa_enabled);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON public.security_blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_until ON public.security_blocked_ips(banned_until);
CREATE INDEX IF NOT EXISTS idx_server_stats_timestamp ON public.infra_server_stats(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_ip ON public.security_incidents(ip_source);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON public.security_incidents(created_at DESC);
-- Row Level Security
ALTER TABLE public.admin_ui_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infra_server_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
-- Function to check if IP is banned
CREATE OR REPLACE FUNCTION is_ip_banned(p_ip INET) RETURNS BOOLEAN AS $$
DECLARE v_banned BOOLEAN;
BEGIN
SELECT EXISTS(
        SELECT 1
        FROM public.security_blocked_ips
        WHERE ip_address = p_ip
            AND (
                banned_until IS NULL
                OR banned_until > now()
            )
    ) INTO v_banned;
RETURN v_banned;
END;
$$ LANGUAGE plpgsql;
-- Function to auto-ban IP after multiple attempts
CREATE OR REPLACE FUNCTION auto_ban_ip(
        p_ip INET,
        p_reason VARCHAR,
        p_duration_hours INT DEFAULT 24
    ) RETURNS void AS $$ BEGIN
INSERT INTO public.security_blocked_ips (ip_address, reason, banned_until)
VALUES (
        p_ip,
        p_reason,
        now() + (p_duration_hours || ' hours')::INTERVAL
    ) ON CONFLICT (ip_address) DO
UPDATE
SET ban_count = public.security_blocked_ips.ban_count + 1,
    banned_until = now() + (p_duration_hours || ' hours')::INTERVAL,
    banned_at = now();
END;
$$ LANGUAGE plpgsql;
-- Function to get server health summary
CREATE OR REPLACE FUNCTION get_server_health_summary() RETURNS TABLE (
        avg_cpu DECIMAL,
        avg_ram DECIMAL,
        avg_disk DECIMAL,
        current_connections INT,
        status VARCHAR
    ) AS $$
DECLARE v_avg_cpu DECIMAL;
v_avg_ram DECIMAL;
BEGIN -- Get average stats from last hour
SELECT AVG(cpu_usage_percent),
    AVG(ram_usage_percent),
    AVG(disk_usage_percent) INTO v_avg_cpu,
    v_avg_ram,
    avg_disk
FROM public.infra_server_stats
WHERE timestamp > now() - INTERVAL '1 hour';
RETURN QUERY
SELECT COALESCE(v_avg_cpu, 0) as avg_cpu,
    COALESCE(v_avg_ram, 0) as avg_ram,
    avg_disk,
    (
        SELECT active_connections
        FROM public.infra_server_stats
        ORDER BY timestamp DESC
        LIMIT 1
    ) as current_connections,
    CASE
        WHEN v_avg_cpu > 90
        OR v_avg_ram > 90 THEN 'CRITICAL'::VARCHAR
        WHEN v_avg_cpu > 75
        OR v_avg_ram > 75 THEN 'WARNING'::VARCHAR
        ELSE 'HEALTHY'::VARCHAR
    END as status;
END;
$$ LANGUAGE plpgsql;
-- Function to get recent security incidents
CREATE OR REPLACE FUNCTION get_recent_security_incidents(p_limit INT DEFAULT 50) RETURNS TABLE (
        attack_type VARCHAR,
        severity VARCHAR,
        ip_source INET,
        count BIGINT,
        last_seen TIMESTAMP WITH TIME ZONE
    ) AS $$ BEGIN RETURN QUERY
SELECT si.attack_type,
    si.severity,
    si.ip_source,
    COUNT(*)::BIGINT as count,
    MAX(si.created_at) as last_seen
FROM public.security_incidents si
WHERE si.created_at > now() - INTERVAL '24 hours'
GROUP BY si.attack_type,
    si.severity,
    si.ip_source
ORDER BY count DESC,
    last_seen DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
-- Seed default admin UI config
INSERT INTO public.admin_ui_configs (admin_id, theme_mode, layout_json)
SELECT id,
    'DARK',
    '{
    "widgets": {
        "finance": {"visible": true, "position": "top-left"},
        "analytics": {"visible": true, "position": "top-right"},
        "security": {"visible": true, "position": "bottom-left"}
    }
}'::JSONB
FROM public.users
WHERE email = 'admin@cekkirim.com' ON CONFLICT DO NOTHING;
COMMENT ON TABLE public.admin_ui_configs IS 'Admin dashboard UI customization and layout preferences';
COMMENT ON TABLE public.admin_security_settings IS '2FA and IP whitelist security settings for admins';
COMMENT ON TABLE public.security_blocked_ips IS 'Banned IP addresses from cyber attacks';
COMMENT ON TABLE public.infra_server_stats IS 'Real-time server health monitoring data';
COMMENT ON TABLE public.security_incidents IS 'Log of detected cyber attack attempts';