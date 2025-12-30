-- Table: Admin Activity Logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,         -- e.g., 'APPROVE_WITHDRAW', 'BLOCK_USER'
    target TEXT,                  -- e.g., 'User: Budi', 'Order: #123'
    details JSONB DEFAULT '{}',   -- Extra metadata
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);

-- RLS: Only admins can view, only system can insert (via function or server action)
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Admins can view all logs" ON admin_activity_logs
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_profiles WHERE id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can insert logs" ON admin_activity_logs
        FOR INSERT
        TO authenticated
        WITH CHECK ( admin_id = auth.uid() );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
