-- Add 'admin' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Add email_verified column to fim_registrations for email verification feature
ALTER TABLE public.fim_registrations ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.fim_registrations ADD COLUMN IF NOT EXISTS email_verification_token text;
ALTER TABLE public.fim_registrations ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone;