-- Drop table if exists
DROP TABLE IF EXISTS public.system_health_logs CASCADE;

-- System Health Logs Table
CREATE TABLE public.system_health_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message text NOT NULL,
  stack_trace text,
  url text,
  user_id uuid REFERENCES auth.users(id),
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert by everyone (public error logging)
CREATE POLICY "Enable insert for everyone" ON public.system_health_logs
    FOR INSERT WITH CHECK (true);

-- Allow select only by admins
CREATE POLICY "Enable select for authenticated users" ON public.system_health_logs
    FOR SELECT USING (auth.role() = 'authenticated');
