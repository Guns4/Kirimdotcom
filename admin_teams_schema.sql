-- Enum: Admin Roles
-- Drop type if exists to prevent error on re-run or handle carefully
DO $$ BEGIN
    CREATE TYPE public.admin_role_enum AS ENUM (
        'SUPER_ADMIN', 
        'FINANCE', 
        'SUPPORT', 
        'CONTENT', 
        'LOGISTICS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: Admin Profiles (Linking Auth Users to Roles)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role admin_role_enum NOT NULL DEFAULT 'SUPPORT',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Admin Invites
CREATE TABLE IF NOT EXISTS public.admin_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role admin_role_enum NOT NULL,
    token TEXT NOT NULL UNIQUE, -- Secure Random String
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
