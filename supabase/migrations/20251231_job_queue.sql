-- Job Queue System Schema
-- Created At: 2025-12-31

CREATE TYPE public.job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  status public.job_status DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_error TEXT,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching pending jobs
CREATE INDEX IF NOT EXISTS idx_jobs_pending 
ON public.jobs (created_at) 
WHERE status = 'pending';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies (Locked down to service role by default for security)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow read/write only for service_role or admin (adjust as needed)
-- For now, we assume the worker runs as service_role usually, but if authenticated users enqueue, we might need insert policy.
CREATE POLICY "Service Role Full Access" ON public.jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
