-- Add recommendation fields to fim_training_registrations
ALTER TABLE public.fim_training_registrations
ADD COLUMN IF NOT EXISTS recommender_name text,
ADD COLUMN IF NOT EXISTS recommender_duration text,
ADD COLUMN IF NOT EXISTS recommender_position text,
ADD COLUMN IF NOT EXISTS recommendation_file_url text;

-- Add interview feedback field to interview_schedules (for notes when marking completed)
ALTER TABLE public.interview_schedules
ADD COLUMN IF NOT EXISTS interview_feedback text;