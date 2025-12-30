-- Job Queue System
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS job_queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, DEAD
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    next_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast frequent polling
CREATE INDEX IF NOT EXISTS idx_job_queues_fetch 
ON job_queues (status, next_run_at) 
WHERE status IN ('PENDING', 'FAILED');
