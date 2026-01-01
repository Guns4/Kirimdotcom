-- ============================================
-- GOD MODE PHASE 701-800: MOBILE & PLUGINS
-- Remote Config, Push Notifications, Plugin Repository
-- ============================================
-- MOBILE APP CONFIG TABLE (Remote Configuration)
CREATE TABLE IF NOT EXISTS public.mobile_app_config (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    -- Single row enforcement
    min_version_code INT DEFAULT 1,
    latest_version_code INT DEFAULT 1,
    latest_version_name VARCHAR(50) DEFAULT '1.0.0',
    force_update BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    playstore_url TEXT,
    appstore_url TEXT,
    update_message TEXT,
    features_json JSONB,
    -- For feature flags in mobile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- PLUGIN RELEASES TABLE (B2B Plugin Distribution)
CREATE TABLE IF NOT EXISTS public.plugin_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plugin_slug VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    changelog TEXT,
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    is_stable BOOLEAN DEFAULT true,
    min_php_version VARCHAR(20) DEFAULT '7.4',
    min_wp_version VARCHAR(20) DEFAULT '5.0',
    tested_up_to VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plugin_slug, version)
);
-- PUSH NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    target_type VARCHAR(20) DEFAULT 'ALL' CHECK (target_type IN ('ALL', 'SPECIFIC', 'SEGMENT')),
    target_user_id UUID REFERENCES public.users(id),
    fcm_response JSONB,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    sent_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Seed default mobile config
INSERT INTO public.mobile_app_config (
        id,
        min_version_code,
        latest_version_code,
        latest_version_name,
        force_update,
        maintenance_mode,
        playstore_url,
        appstore_url,
        update_message
    )
VALUES (
        1,
        1,
        1,
        '1.0.0',
        false,
        false,
        'https://play.google.com/store/apps/details?id=com.cekkirim.app',
        'https://apps.apple.com/app/cekkirim/id123456789',
        'Update aplikasi untuk mendapatkan fitur terbaru!'
    ) ON CONFLICT (id) DO NOTHING;
-- Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_releases_slug ON public.plugin_releases(plugin_slug);
CREATE INDEX IF NOT EXISTS idx_plugin_releases_public ON public.plugin_releases(is_public);
CREATE INDEX IF NOT EXISTS idx_plugin_releases_created ON public.plugin_releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_logs_created ON public.push_notification_logs(created_at DESC);
-- Row Level Security
ALTER TABLE public.mobile_app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_releases ENABLE ROW LEVEL SECURITY;
-- Policy: Anyone can read mobile config (for app startup)
DROP POLICY IF EXISTS "Anyone can read mobile config" ON public.mobile_app_config;
CREATE POLICY "Anyone can read mobile config" ON public.mobile_app_config FOR
SELECT USING (true);
-- Policy: Anyone can read public plugin releases
DROP POLICY IF EXISTS "Anyone can read public plugins" ON public.plugin_releases;
CREATE POLICY "Anyone can read public plugins" ON public.plugin_releases FOR
SELECT USING (is_public = true);
-- Function to increment plugin download count
CREATE OR REPLACE FUNCTION increment_plugin_downloads(p_release_id UUID) RETURNS void AS $$ BEGIN
UPDATE public.plugin_releases
SET download_count = download_count + 1
WHERE id = p_release_id;
END;
$$ LANGUAGE plpgsql;
-- Function to get latest plugin version
CREATE OR REPLACE FUNCTION get_latest_plugin_version(p_slug VARCHAR) RETURNS TABLE (
        version VARCHAR,
        file_url TEXT,
        changelog TEXT,
        download_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT pr.version,
    pr.file_url,
    pr.changelog,
    pr.download_count
FROM public.plugin_releases pr
WHERE pr.plugin_slug = p_slug
    AND pr.is_public = true
    AND pr.is_stable = true
ORDER BY pr.created_at DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- Trigger to update mobile_app_config timestamp
CREATE OR REPLACE FUNCTION update_mobile_config_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_mobile_config_update ON public.mobile_app_config;
CREATE TRIGGER trigger_mobile_config_update BEFORE
UPDATE ON public.mobile_app_config FOR EACH ROW EXECUTE FUNCTION update_mobile_config_timestamp();
COMMENT ON TABLE public.mobile_app_config IS 'Remote configuration for mobile app version control and maintenance';
COMMENT ON TABLE public.plugin_releases IS 'B2B plugin release repository for WordPress/WooCommerce plugins';
COMMENT ON TABLE public.push_notification_logs IS 'Log of all push notifications sent via FCM';