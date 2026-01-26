-- Add timeline fields to registration_settings table for batch management
ALTER TABLE public.registration_settings 
ADD COLUMN IF NOT EXISTS admin_review_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_review_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_result_announcement_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS final_result_announcement_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS allow_edit_beyond_timeline boolean DEFAULT false;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_registration_settings_dates 
ON public.registration_settings (admin_review_start_date, interview_start_date);

COMMENT ON COLUMN public.registration_settings.admin_review_start_date IS 'Start date for administration review period';
COMMENT ON COLUMN public.registration_settings.admin_review_end_date IS 'End date for administration review period';
COMMENT ON COLUMN public.registration_settings.admin_result_announcement_date IS 'Date when admin selection results are announced';
COMMENT ON COLUMN public.registration_settings.interview_start_date IS 'Start date for interview period';
COMMENT ON COLUMN public.registration_settings.interview_end_date IS 'End date for interview period';
COMMENT ON COLUMN public.registration_settings.final_result_announcement_date IS 'Date when final results are announced';
COMMENT ON COLUMN public.registration_settings.allow_edit_beyond_timeline IS 'Allow editing beyond defined timelines';