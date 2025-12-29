-- Ensure Reviews Table Exists
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    target_type TEXT NOT NULL, -- 'bank_account', 'phone_number', etc.
    target_value TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_verified column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Index for filtering verified reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified 
ON public.reviews(is_verified) 
WHERE is_verified = true;
