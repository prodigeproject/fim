-- Add logo_url column to fim_clubs
ALTER TABLE public.fim_clubs ADD COLUMN IF NOT EXISTS logo_url text;

-- Add logo_url column to fim_regionals
ALTER TABLE public.fim_regionals ADD COLUMN IF NOT EXISTS logo_url text;

-- Enable pg_cron and pg_net extensions for scheduled broadcasts
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;