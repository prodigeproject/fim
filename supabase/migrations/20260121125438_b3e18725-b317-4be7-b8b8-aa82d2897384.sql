-- Add interviewer_name to interview_schedules
ALTER TABLE public.interview_schedules 
ADD COLUMN IF NOT EXISTS interviewer_name text;

-- Add NIK to training registrations
ALTER TABLE public.fim_training_registrations 
ADD COLUMN IF NOT EXISTS nik text;

-- Create blocked_registrations table for blocking accounts
CREATE TABLE IF NOT EXISTS public.blocked_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  phone text,
  full_name text,
  nik text,
  blocked_by uuid,
  blocked_reason text,
  blocked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint for email
ALTER TABLE public.blocked_registrations ADD CONSTRAINT blocked_registrations_email_key UNIQUE (email);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_registrations_email ON public.blocked_registrations(email);
CREATE INDEX IF NOT EXISTS idx_blocked_registrations_phone ON public.blocked_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_blocked_registrations_nik ON public.blocked_registrations(nik);

-- Enable RLS
ALTER TABLE public.blocked_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_registrations
CREATE POLICY "Admins can view blocked registrations" 
ON public.blocked_registrations 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can insert blocked registrations" 
ON public.blocked_registrations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete blocked registrations" 
ON public.blocked_registrations 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create unique constraint on registration_id for interview_schedules to prevent double scheduling
-- First drop existing if any, then add
DO $$
BEGIN
  -- Check if index exists
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_interview_schedules_registration_unique') THEN
    CREATE UNIQUE INDEX idx_interview_schedules_registration_unique 
    ON public.interview_schedules(registration_id) 
    WHERE status IN ('scheduled', 'completed');
  END IF;
END $$;