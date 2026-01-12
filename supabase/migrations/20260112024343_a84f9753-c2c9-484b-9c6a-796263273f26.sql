-- Add selection stage to fim_registrations for multi-stage selection process
-- Stages: administrasi (admin selection) -> wawancara (interview) -> pengumuman (announcement/final)

ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS selection_stage TEXT DEFAULT 'administrasi' CHECK (selection_stage IN ('administrasi', 'wawancara', 'pengumuman'));

-- Add notes for each stage
ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS admin_selection_note TEXT;

ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS interview_note TEXT;

ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS final_result TEXT CHECK (final_result IN ('lolos', 'tidak_lolos', null));

-- Add phone country code field
ALTER TABLE public.fim_registrations 
ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+62';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_fim_registrations_selection_stage ON public.fim_registrations(selection_stage);
CREATE INDEX IF NOT EXISTS idx_fim_registrations_final_result ON public.fim_registrations(final_result);