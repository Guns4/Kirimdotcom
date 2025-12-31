CREATE TYPE webhook_status AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'GAVE_UP');

CREATE TABLE IF NOT EXISTS public.webhook_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    payload JSONB NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    status webhook_status DEFAULT 'PENDING',
    last_error TEXT,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for worker polling
CREATE INDEX IF NOT EXISTS idx_webhook_pending 
ON public.webhook_queue(status, next_attempt_at) 
WHERE status IN ('PENDING', 'FAILED');

-- RLS
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.webhook_queue FOR SELECT USING (true);
