-- Table: unboxing_reviews
CREATE TABLE IF NOT EXISTS public.unboxing_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resi_number TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT, -- Optional, can store first frame if processed
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false, -- Moderation queue
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.unboxing_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved videos
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.unboxing_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.unboxing_reviews FOR SELECT
  USING (is_approved = true);

-- Policy: Authenticated users can insert
DROP POLICY IF EXISTS "Users can upload reviews" ON public.unboxing_reviews;
CREATE POLICY "Users can upload reviews"
  ON public.unboxing_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Storage Bucket Instructions (Run in SQL Editor if possible, otherwise UI)
-- Create bucket manually in Supabase Storage UI:
-- Bucket name: unboxing-videos
-- Public: true

-- Storage policies (run after bucket creation)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'unboxing-videos');

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'unboxing-videos' AND auth.role() = 'authenticated');
