-- Add Storage Columns to Profiles (assuming 'profiles' table exists, if not create basic structure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 52428800, -- 50MB Default
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'FREE'; -- FREE, PREMIUM

-- Function to increment storage used
CREATE OR REPLACE FUNCTION increment_storage_used(user_id UUID, bytes BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET storage_used = storage_used + bytes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
