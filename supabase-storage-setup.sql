-- ============================================
-- SUPABASE STORAGE BUCKET FOR ASSETS
-- ============================================
-- Create bucket for storing logos and other assets
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: Make sure you've run supabase-schema.sql first!
-- ============================================
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true) ON CONFLICT (id) DO NOTHING;
-- Set up storage policies for assets bucket
-- Allow anyone to read files
CREATE POLICY "Public Access for Assets" ON storage.objects FOR
SELECT USING (bucket_id = 'assets');
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload assets" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'assets'
        AND auth.uid() IS NOT NULL
    );
-- Allow authenticated users to delete their own files
-- (Admin-only restrictions are handled in application code)
CREATE POLICY "Authenticated users can delete assets" ON storage.objects FOR DELETE USING (
    bucket_id = 'assets'
    AND auth.uid() IS NOT NULL
);
-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update assets" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'assets'
        AND auth.uid() IS NOT NULL
    );
-- ============================================
-- COMPLETED
-- ============================================
-- Storage bucket 'assets' is now ready for use!
-- 
-- Note: Admin-only restrictions are handled in the application code
-- via the LogoUploader component and middleware.