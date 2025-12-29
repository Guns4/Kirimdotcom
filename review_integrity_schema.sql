-- Add is_verified column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Index for filtering verified reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified 
ON public.reviews(is_verified) 
WHERE is_verified = true;
