
-- Drop the overly permissive "Allow authenticated" policies
DROP POLICY IF EXISTS "Allow authenticated read from registration-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to registration-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update in registration-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from registration-photos" ON storage.objects;

-- Drop duplicate ownership policies (keep the ones with admin access)
DROP POLICY IF EXISTS "Users can delete their own registration photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own registration photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own registration photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own registration photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own registration photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own registration photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own registration photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own registration photos" ON storage.objects;

-- Now the only remaining policy should be "Users can view own registration photos" with admin access
-- Create the missing ownership+admin policies for INSERT, UPDATE, DELETE

CREATE POLICY "Users can upload own registration photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'registration-photos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);

CREATE POLICY "Users can update own registration photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'registration-photos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);

CREATE POLICY "Users can delete own registration photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'registration-photos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);
