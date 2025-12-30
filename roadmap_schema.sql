-- 1. Feature Requests Table
CREATE TABLE IF NOT EXISTS public.feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'proposed', -- 'proposed', 'planned', 'in_progress', 'completed'
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Votes Table (Prevent double voting)
CREATE TABLE IF NOT EXISTS public.feature_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.feature_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, request_id)
);

-- 3. Trigger to Update Vote Count
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.request_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.request_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vote_count ON public.feature_votes;
CREATE TRIGGER trg_vote_count
AFTER INSERT OR DELETE ON public.feature_votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read requests" ON public.feature_requests;
CREATE POLICY "Public read requests" ON public.feature_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create requests" ON public.feature_requests;
CREATE POLICY "Users can create requests" ON public.feature_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can vote" ON public.feature_votes;
CREATE POLICY "Users can vote" ON public.feature_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
