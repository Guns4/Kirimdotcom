-- Add domain whitelist to API keys/licenses
ALTER TABLE public.plugin_licenses 
ADD COLUMN IF NOT EXISTS allowed_domains TEXT[] DEFAULT '{}';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_plugin_licenses_key ON public.plugin_licenses(license_key);

COMMENT ON COLUMN public.plugin_licenses.allowed_domains IS 'Whitelist of domains allowed to use this API key. Empty array = development mode (all domains allowed)';
