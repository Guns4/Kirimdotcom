-- ============================================
-- GOD MODE PHASE 2401-2500: DISTRIBUTION & LICENSING
-- Plugin License Management, App Store Monitoring
-- ============================================
-- PRODUCT LICENSES TABLE (DRM Protection)
CREATE TABLE IF NOT EXISTS public.product_licenses (
    key UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    product_slug VARCHAR(100) NOT NULL,
    -- 'cekkirim-woo-plugin'
    product_name VARCHAR(255),
    max_domains INT DEFAULT 1,
    registered_domains TEXT [] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED')
    ),
    expiry_date DATE,
    activation_count INT DEFAULT 0,
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- APP RELEASE STATUS TABLE (Store Monitoring)
CREATE TABLE IF NOT EXISTS public.app_release_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(10) CHECK (platform IN ('ANDROID', 'IOS', 'WEB')),
    version VARCHAR(20) NOT NULL,
    build_number INT,
    status VARCHAR(20) CHECK (
        status IN (
            'DRAFT',
            'IN_REVIEW',
            'PUBLISHED',
            'REJECTED',
            'REMOVED'
        )
    ),
    rejection_reason TEXT,
    release_notes TEXT,
    released_at TIMESTAMP WITH TIME ZONE,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- APP CRASH STATS TABLE (Quality Monitoring)
CREATE TABLE IF NOT EXISTS public.app_crash_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(10) CHECK (platform IN ('ANDROID', 'IOS')),
    date DATE NOT NULL,
    version VARCHAR(20),
    crash_free_users_percent DECIMAL(5, 2) DEFAULT 100.0,
    -- 99.8%
    total_crashes INT DEFAULT 0,
    total_users INT DEFAULT 0,
    crash_rate_percent DECIMAL(5, 2) AS (100.0 - crash_free_users_percent) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(platform, date, version)
);
-- LICENSE ACTIVATION LOG TABLE
CREATE TABLE IF NOT EXISTS public.license_activation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_key UUID REFERENCES public.product_licenses(key),
    domain VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    action VARCHAR(20) CHECK (action IN ('ACTIVATE', 'DEACTIVATE', 'CHECK')),
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user ON public.product_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.product_licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_product ON public.product_licenses(product_slug);
CREATE INDEX IF NOT EXISTS idx_app_status_platform ON public.app_release_status(platform);
CREATE INDEX IF NOT EXISTS idx_crash_stats_platform_date ON public.app_crash_stats(platform, date DESC);
CREATE INDEX IF NOT EXISTS idx_license_log_key ON public.license_activation_log(license_key);
-- Row Level Security
ALTER TABLE public.product_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_release_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_crash_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activation_log ENABLE ROW LEVEL SECURITY;
-- Function to validate license
CREATE OR REPLACE FUNCTION validate_license(
        p_license_key UUID,
        p_domain VARCHAR
    ) RETURNS TABLE (
        is_valid BOOLEAN,
        message TEXT,
        product_slug VARCHAR
    ) AS $$
DECLARE v_license RECORD;
v_domain_count INT;
BEGIN -- Get license details
SELECT * INTO v_license
FROM public.product_licenses
WHERE key = p_license_key;
IF NOT FOUND THEN RETURN QUERY
SELECT false,
    'Invalid license key'::TEXT,
    NULL::VARCHAR;
RETURN;
END IF;
-- Check if expired
IF v_license.expiry_date IS NOT NULL
AND v_license.expiry_date < CURRENT_DATE THEN RETURN QUERY
SELECT false,
    'License expired'::TEXT,
    v_license.product_slug;
RETURN;
END IF;
-- Check if suspended
IF v_license.status != 'ACTIVE' THEN RETURN QUERY
SELECT false,
    'License suspended or revoked'::TEXT,
    v_license.product_slug;
RETURN;
END IF;
-- Check if domain already registered
IF p_domain = ANY(v_license.registered_domains) THEN RETURN QUERY
SELECT true,
    'Domain already activated'::TEXT,
    v_license.product_slug;
RETURN;
END IF;
-- Check if max domains reached
v_domain_count := array_length(v_license.registered_domains, 1);
IF v_domain_count IS NULL THEN v_domain_count := 0;
END IF;
IF v_domain_count >= v_license.max_domains THEN RETURN QUERY
SELECT false,
    'Maximum domain limit reached'::TEXT,
    v_license.product_slug;
RETURN;
END IF;
-- All checks passed
RETURN QUERY
SELECT true,
    'Valid license'::TEXT,
    v_license.product_slug;
END;
$$ LANGUAGE plpgsql;
-- Function to register domain to license
CREATE OR REPLACE FUNCTION register_license_domain(
        p_license_key UUID,
        p_domain VARCHAR
    ) RETURNS BOOLEAN AS $$
DECLARE v_validation RECORD;
BEGIN -- Validate first
SELECT * INTO v_validation
FROM validate_license(p_license_key, p_domain);
IF NOT v_validation.is_valid THEN RETURN false;
END IF;
-- Add domain to registered list
UPDATE public.product_licenses
SET registered_domains = array_append(registered_domains, p_domain),
    activation_count = activation_count + 1,
    updated_at = now()
WHERE key = p_license_key;
RETURN true;
END;
$$ LANGUAGE plpgsql;
-- Seed sample app release status
INSERT INTO public.app_release_status (
        platform,
        version,
        build_number,
        status,
        release_notes
    )
VALUES (
        'ANDROID',
        '1.2.0',
        120,
        'PUBLISHED',
        'Bug fixes and performance improvements'
    ),
    (
        'IOS',
        '1.2.1',
        121,
        'IN_REVIEW',
        'New features and UI updates'
    ),
    (
        'WEB',
        '2.0.0',
        200,
        'PUBLISHED',
        'Complete redesign'
    ) ON CONFLICT DO NOTHING;
-- Seed sample crash stats
INSERT INTO public.app_crash_stats (
        platform,
        date,
        version,
        crash_free_users_percent,
        total_crashes,
        total_users
    )
VALUES ('ANDROID', CURRENT_DATE, '1.2.0', 99.5, 25, 5000),
    ('IOS', CURRENT_DATE, '1.2.1', 99.8, 10, 5000) ON CONFLICT DO NOTHING;
COMMENT ON TABLE public.product_licenses IS 'License keys for SaaS plugins and products (DRM protection)';
COMMENT ON TABLE public.app_release_status IS 'Mobile app release status on Play Store and App Store';
COMMENT ON TABLE public.app_crash_stats IS 'Crash analytics for quality monitoring';