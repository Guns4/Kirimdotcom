-- Add deleted_at column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Function to Soft Delete User
CREATE OR REPLACE FUNCTION public.soft_delete_user()
RETURNS VOID AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Mark profile as deleted
    UPDATE public.profiles
    SET deleted_at = NOW(),
        email = 'deleted_' || current_user_id || '@deleted.com', -- Anonymize PII
        username = 'deleted_user_' || current_user_id,
        full_name = 'Deleted User'
    WHERE id = current_user_id;

    -- Ideally, we should also handle auth.users soft deletion or banning.
    -- Calling Supabase Admin API from Edge Functions is safer for managing auth.users.
    -- This function handles the public profile data anonymization.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
