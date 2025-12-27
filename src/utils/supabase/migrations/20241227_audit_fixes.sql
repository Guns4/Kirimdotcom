-- 1. Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_date ON public.search_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_resi_lookup ON public.cached_resi (resi_number, courier_code);
-- 2. Ensure FK constraint exists (safe for Supabase)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_search_history_user'
) THEN
ALTER TABLE public.search_history
ADD CONSTRAINT fk_search_history_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
END $$;