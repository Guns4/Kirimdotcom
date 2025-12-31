CREATE TABLE IF NOT EXISTS public.wa_sessions (
    session_id VARCHAR PRIMARY KEY,
    data JSONB NOT NULL, -- Stores serialized credentials
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.wa_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own WA sessions" ON public.wa_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all WA sessions" ON public.wa_sessions
    FOR ALL USING (true) WITH CHECK (true);
