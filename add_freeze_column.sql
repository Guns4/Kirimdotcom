-- Add freeze-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- Create index for quick frozen account checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_frozen ON public.profiles(is_frozen);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_frozen IS 'Flag indicating if account is frozen due to fraud detection';
COMMENT ON COLUMN public.profiles.status IS 'Account status: ACTIVE, SUSPENDED, BANNED, DELETED';
