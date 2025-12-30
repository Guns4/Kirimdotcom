-- Enums
DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM ('OPEN', 'REPLIED', 'CLOSED');
    CREATE TYPE public.ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    CREATE TYPE public.message_role AS ENUM ('USER', 'ADMIN', 'SYSTEM');
    -- Ensure Admin Role Enum exists
    CREATE TYPE public.admin_role_enum AS ENUM ('SUPER_ADMIN', 'FINANCE', 'SUPPORT', 'CONTENT', 'LOGISTICS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure Admin Profiles exists (Defensive)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role admin_role_enum NOT NULL DEFAULT 'SUPPORT',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    status ticket_status DEFAULT 'OPEN',
    priority ticket_priority DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Messages
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id), -- Nullable for system messages or if anonymous
    role message_role NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]', -- URLs to files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_messages(ticket_id);

-- RLS (Simplified)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins can view all tickets" ON support_tickets
        FOR ALL TO authenticated
        USING ( EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()) );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all messages" ON support_messages
        FOR ALL TO authenticated
        USING ( EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()) );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
