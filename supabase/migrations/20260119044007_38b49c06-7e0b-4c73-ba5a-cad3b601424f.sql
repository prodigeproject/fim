-- First drop the old constraint and add new one with proper values
ALTER TABLE public.fim_registrations DROP CONSTRAINT IF EXISTS fim_registrations_selection_stage_check;

-- Add selection_passed column to track if user passed current stage (lolos/tidak lolos)
ALTER TABLE public.fim_registrations ADD COLUMN IF NOT EXISTS selection_passed boolean DEFAULT NULL;

-- Add column to track if admin_selection_note is visible to applicant
ALTER TABLE public.fim_registrations ADD COLUMN IF NOT EXISTS note_visible_to_applicant boolean DEFAULT false;

-- Re-add the constraint with valid stages
ALTER TABLE public.fim_registrations ADD CONSTRAINT fim_registrations_selection_stage_check 
CHECK (selection_stage = ANY (ARRAY['administrasi'::text, 'wawancara'::text, 'pengumuman'::text]));