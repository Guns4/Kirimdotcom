-- Account Deletion & Anonymization Schema
-- Compliance for App Store / Play Store (GDPR)

-- 1. Ensure we have a deleted_at column on agents (if not exist)
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create RPC function to Soft Delete & Anonymize
CREATE OR REPLACE FUNCTION soft_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if user exists (implicit via update)
    
    -- Anonymize Agent Data (if agent exists)
    UPDATE public.agents
    SET 
        shop_name = 'Deleted User',
        shop_address = 'Data Deleted',
        phone_number = '0000000000',
        ktp_url = NULL,
        shop_photo_url = NULL,
        status = 'DELETED',
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE user_id = target_user_id;

    -- If there were other public profile tables, update them here too
    -- UPDATE public.profiles SET full_name = 'Deleted', ...

    -- Note: We do NOT delete the row to maintain financial integrity (Foreign Keys).
    -- But PII like names/phones are gone.

    -- Optional: Log the deletion
    INSERT INTO public.system_logs (level, message, metadata)
    VALUES ('INFO', 'User Account Deleted', jsonb_build_object('user_id', target_user_id));

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
