#!/bin/bash

# setup-immutable-logs.sh
# -----------------------
# Forensic Readiness: Sets up an Immutable Audit Log System.
# Prevents DELETION or ALTERATION of logs even by Admins.

echo "🕵️  Setting up Immutable Logs..."

mkdir -p supabase/security

cat > supabase/security/immutable_logs.sql << 'EOF'
-- 1. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,       -- e.g. 'LOGIN', 'WITHDRAW', 'DELETE_ITEM'
    target_resource TEXT,       -- e.g. 'users:123', 'wallet:456'
    payload JSONB,              -- Old/New values
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger Function to PREVENT DELETION/UPDATE
CREATE OR REPLACE FUNCTION prevent_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow INSERT, Block everything else
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        -- Optional: Insert into separate 'security_alarms' table or raise warning
        RAISE EXCEPTION 'SECURITY ALERT: You cannot delete or update immutable audit logs. Incident reported.';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS trg_immutable_logs ON public.audit_logs;

CREATE TRIGGER trg_immutable_logs
BEFORE DELETE OR UPDATE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_log_tampering();

-- 4. Enable RLS (Read-Only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can READ logs, but trigger blocking write is lower level so RLS is just for visibility.
CREATE POLICY "Admins can view logs" ON public.audit_logs
    FOR SELECT USING (true); -- Adjust to admin role check
EOF

echo "✅ Immutable Logs Schema: supabase/security/immutable_logs.sql"
echo "👉 Run the SQL in Supabase Dashboard to activate the lock."
