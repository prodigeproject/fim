-- Add recommender email and phone fields to fim_training_registrations
ALTER TABLE public.fim_training_registrations 
ADD COLUMN IF NOT EXISTS recommender_email text,
ADD COLUMN IF NOT EXISTS recommender_phone text;

-- Create recruiter assignment table for delegating recruitment tasks
CREATE TABLE IF NOT EXISTS public.recruiter_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.fim_registrations(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL,
  assigned_by uuid,
  assignment_type text NOT NULL CHECK (assignment_type IN ('administrasi', 'wawancara', 'both')),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(registration_id, assigned_to, assignment_type)
);

-- Enable RLS on recruiter_assignments
ALTER TABLE public.recruiter_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for recruiter_assignments
CREATE POLICY "Admins can view all assignments"
ON public.recruiter_assignments FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can manage assignments"
ON public.recruiter_assignments FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert assignments"
ON public.recruiter_assignments FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update assignments"
ON public.recruiter_assignments FOR UPDATE
USING (is_admin(auth.uid()));

-- Create registration_activity_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.registration_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.fim_registrations(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on registration_activity_logs
ALTER TABLE public.registration_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for registration_activity_logs
CREATE POLICY "Admins can view activity logs"
ON public.registration_activity_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert activity logs"
ON public.registration_activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for registration_activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_activity_logs;

-- Update storage RLS for registration-photos bucket to fix upload issues
-- First, ensure the bucket exists (should already exist but just in case)
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-photos', 'registration-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Registrants can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Registrants can view own photos" ON storage.objects;
DROP POLICY IF EXISTS "Registrants can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all registration photos" ON storage.objects;
DROP POLICY IF EXISTS "Registrant upload access" ON storage.objects;
DROP POLICY IF EXISTS "Registrant read access" ON storage.objects;

-- Create proper storage policies for registration-photos bucket
CREATE POLICY "Allow authenticated upload to registration-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'registration-photos');

CREATE POLICY "Allow authenticated read from registration-photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'registration-photos');

CREATE POLICY "Allow authenticated update in registration-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'registration-photos');

CREATE POLICY "Allow authenticated delete from registration-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'registration-photos');