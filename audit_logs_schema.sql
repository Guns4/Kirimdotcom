-- =====================================================
-- AUDIT LOGS SCHEMA - Compatible with Existing Table
-- =====================================================

-- 1. Add missing columns to existing audit_logs table
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS target_table TEXT;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS record_id TEXT;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS old_data JSONB;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS new_data JSONB;

-- Rename user_id to actor_id if needed (optional migration)
-- UPDATE public.audit_logs SET actor_id = user_id WHERE actor_id IS NULL AND user_id IS NOT NULL;

-- 2. Create Index for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);

-- 3. Enable RLS (Read-only for Admins)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Service role full access" ON public.audit_logs;
CREATE POLICY "Service role full access"
    ON public.audit_logs
    FOR ALL
    USING (auth.role() = 'service_role');

-- 4. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
    v_old_data JSONB;
    v_new_data JSONB;
    v_record_id TEXT;
BEGIN
    -- Get current user from Supabase auth
    v_actor_id := auth.uid();
    
    -- Extract IP and UA from request headers (Supabase specific)
    BEGIN
        v_ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
        v_user_agent := current_setting('request.headers', true)::json->>'user-agent';
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
        v_user_agent := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        v_record_id := OLD.id::text;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    END IF;

    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_table,
        record_id,
        old_data,
        new_data,
        ip_address,
        user_agent
    ) VALUES (
        v_actor_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old_data,
        v_new_data,
        v_ip_address,
        v_user_agent
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Apply Triggers to Sensitive Tables

-- Orders
DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Transactions
DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Profiles (sensitive user data changes)
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
AFTER UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Subscriptions
DROP TRIGGER IF EXISTS trg_audit_subscriptions ON public.subscriptions;
CREATE TRIGGER trg_audit_subscriptions
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Withdrawal Requests (financial)
DROP TRIGGER IF EXISTS trg_audit_withdrawals ON public.withdrawal_requests;
CREATE TRIGGER trg_audit_withdrawals
AFTER INSERT OR UPDATE OR DELETE ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
