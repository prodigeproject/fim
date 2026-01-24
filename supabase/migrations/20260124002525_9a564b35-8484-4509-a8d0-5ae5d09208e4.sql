-- Add timeline columns to registration_settings for batch management
ALTER TABLE public.registration_settings 
ADD COLUMN IF NOT EXISTS admin_review_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_review_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_result_announcement_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS final_result_announcement_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS allow_edit_beyond_timeline boolean DEFAULT false;

-- Add blocked_users table for blacklisted registrations
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  phone text,
  nik text,
  full_name text,
  reason text,
  blocked_by uuid REFERENCES auth.users(id),
  blocked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Admins can view blocked users"
  ON public.blocked_users
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can insert blocked users"
  ON public.blocked_users
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete blocked users"
  ON public.blocked_users
  FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_users_email ON public.blocked_users(email);
CREATE INDEX IF NOT EXISTS idx_blocked_users_phone ON public.blocked_users(phone);
CREATE INDEX IF NOT EXISTS idx_blocked_users_nik ON public.blocked_users(nik);

-- Add interviewer assignment columns to interview_schedules if not exists
ALTER TABLE public.interview_schedules 
ADD COLUMN IF NOT EXISTS interviewer_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_interviewer_id uuid;