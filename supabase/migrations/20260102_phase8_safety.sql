-- ============================================
-- GOD MODE PHASE 8: AUTOMATION & SAFETY NETS
-- Feature Flags, Audit Trails, Data Backups
-- ============================================
-- SYSTEM FLAGS TABLE (Feature Toggles / Kill Switches)
CREATE TABLE IF NOT EXISTS public.system_flags (
    key VARCHAR(100) PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT true,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES public.users(id)
);
-- SEED DEFAULT FLAGS (Kill Switches)
INSERT INTO public.system_flags (key, is_enabled, description)
VALUES (
        'ENABLE_TOPUP',
        true,
        'Allow users to top-up balance via Midtrans'
    ),
    (
        'ENABLE_WITHDRAW',
        true,
        'Allow users to request withdrawals'
    ),
    (
        'ENABLE_SMM_ORDER',
        true,
        'Allow social media service orders'
    ),
    (
        'ENABLE_PHYSICAL_ORDER',
        true,
        'Allow physical product orders'
    ),
    (
        'ENABLE_SHIPPING_CHECK',
        true,
        'Allow shipping cost calculations'
    ),
    (
        'GLOBAL_MAINTENANCE',
        false,
        'Emergency maintenance mode - disables all services'
    ),
    (
        'ENABLE_REGISTRATION',
        true,
        'Allow new user registrations'
    ),
    (
        'ENABLE_API_ACCESS',
        true,
        'Allow B2B SaaS API access'
    ) ON CONFLICT (key) DO NOTHING;
-- ADMIN AUDIT LOGS TABLE (Admin Activity Tracking)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ALERT CONFIGURATIONS TABLE (Notification Settings)
CREATE TABLE IF NOT EXISTS public.alert_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel VARCHAR(20) CHECK (channel IN ('TELEGRAM', 'EMAIL', 'SMS')),
    target TEXT NOT NULL,
    -- Chat ID, Email, or Phone
    events TEXT [],
    -- ['CRITICAL_ERROR', 'LOW_BALANCE', 'HIGH_TRAFFIC']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
-- Row Level Security
ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
-- Policies (read-only for authenticated users, admin can modify)
DROP POLICY IF EXISTS "Anyone can read flags" ON public.system_flags;
CREATE POLICY "Anyone can read flags" ON public.system_flags FOR
SELECT USING (true);
-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
        p_admin_id UUID,
        p_action TEXT,
        p_details JSONB DEFAULT NULL,
        p_ip TEXT DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_log_id UUID;
BEGIN
INSERT INTO public.admin_audit_logs (admin_id, action, details, ip_address)
VALUES (p_admin_id, p_action, p_details, p_ip)
RETURNING id INTO v_log_id;
RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
-- Function to check if feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(p_key TEXT) RETURNS BOOLEAN AS $$
DECLARE v_enabled BOOLEAN;
BEGIN
SELECT is_enabled INTO v_enabled
FROM public.system_flags
WHERE key = p_key;
IF NOT FOUND THEN RETURN false;
END IF;
RETURN v_enabled;
END;
$$ LANGUAGE plpgsql;
-- Trigger to auto-create admin notification when critical flag changes
CREATE OR REPLACE FUNCTION notify_critical_flag_change() RETURNS TRIGGER AS $$ BEGIN IF NEW.key = 'GLOBAL_MAINTENANCE'
    AND NEW.is_enabled != OLD.is_enabled THEN PERFORM create_admin_notification(
        'CRITICAL',
        CASE
            WHEN NEW.is_enabled THEN 'MAINTENANCE MODE ACTIVATED'
            ELSE 'MAINTENANCE MODE DEACTIVATED'
        END,
        '/admin/dashboard?tab=CONTROLS'
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_flag_change ON public.system_flags;
CREATE TRIGGER trigger_flag_change
AFTER
UPDATE ON public.system_flags FOR EACH ROW EXECUTE FUNCTION notify_critical_flag_change();
COMMENT ON TABLE public.system_flags IS 'Feature flags and kill switches for emergency service control';
COMMENT ON TABLE public.admin_audit_logs IS 'Audit trail of all admin actions for accountability';
COMMENT ON TABLE public.alert_configs IS 'Alert notification configurations for critical events';