-- Create storage bucket for registration photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-photos', 'registration-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for registration photos bucket
CREATE POLICY "Users can upload their own registration photo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'registration-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own registration photo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'registration-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own registration photo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'registration-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Registration photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'registration-photos');

-- Add photo_url column to fim_registrations table
ALTER TABLE public.fim_registrations
ADD COLUMN IF NOT EXISTS photo_url text;