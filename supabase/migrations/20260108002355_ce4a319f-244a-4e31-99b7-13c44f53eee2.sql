-- 1. Make registration-photos bucket public so photos can be accessed
UPDATE storage.buckets SET public = true WHERE id = 'registration-photos';

-- 2. Create storage policies for registration-photos bucket
-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own registration photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'registration-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own photos
CREATE POLICY "Users can update their own registration photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'registration-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own registration photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'registration-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to view registration photos
CREATE POLICY "Anyone can view registration photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'registration-photos');