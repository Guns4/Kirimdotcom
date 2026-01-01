-- TABEL SYSTEM CONFIG (Global Settings)
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- SEED DEFAULT SETTINGS
INSERT INTO public.system_config (key, value, description)
VALUES (
        'ADSENSE_PUB_ID',
        'ca-pub-0000000000000000',
        'Google AdSense Publisher ID'
    ),
    (
        'ADSENSE_RATIO',
        '70',
        'Percentage of Google AdSense display (0-100, remainder is internal ads)'
    ),
    (
        'SITE_NAME',
        'CekKirim.com',
        'Primary website name'
    ),
    (
        'MAINTENANCE_MODE',
        'false',
        'Enable/disable maintenance mode'
    ),
    (
        'MAX_UPLOAD_SIZE_MB',
        '10',
        'Maximum file upload size in MB'
    ) ON CONFLICT (key) DO NOTHING;
-- Policy: Public can read, only service role can update
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Config" ON public.system_config;
CREATE POLICY "Public Read Config" ON public.system_config FOR
SELECT USING (true);
-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(key);
COMMENT ON TABLE public.system_config IS 'Global system configuration for hybrid ad engine and general settings';
COMMENT ON COLUMN public.system_config.key IS 'Unique configuration key identifier';
COMMENT ON COLUMN public.system_config.value IS 'Configuration value (stored as text, parse as needed)';