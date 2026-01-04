-- Add revision_notes column to articles table for revision requests
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS revision_notes TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS revision_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS revision_requested_by UUID;