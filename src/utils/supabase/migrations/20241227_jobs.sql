CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    -- 'Full-time', 'Part-time', 'Freelance'
    location TEXT DEFAULT 'Remote',
    salary_range TEXT,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    resume_url TEXT,
    cover_letter TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jobs" ON jobs FOR
SELECT USING (expires_at > NOW());
CREATE POLICY "Users manage own jobs" ON jobs FOR ALL USING (auth.uid() = user_id);