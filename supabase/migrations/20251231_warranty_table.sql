-- 1. Create Warranties Table
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receipt_number VARCHAR(255),
    item_name VARCHAR(255),
    purchase_date DATE,
    expiry_date DATE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own warranties" ON public.warranties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own warranties" ON public.warranties
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Storage Bucket for Warranty Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('warranty-docs', 'warranty-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload warranty photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'warranty-docs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own warranty photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'warranty-docs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
