-- Add circuit breaker status to licenses
ALTER TABLE public.plugin_licenses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Create index for status checks
CREATE INDEX IF NOT EXISTS idx_plugin_licenses_status ON public.plugin_licenses(status);

COMMENT ON COLUMN public.plugin_licenses.status IS 'ACTIVE, SUSPENDED_TEMPORARY, SUSPENDED_PERMANENT';
