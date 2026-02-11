
-- Add author_display_name column to articles table for editable author name
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS author_display_name text;

-- Add email_settings table for configurable email queue settings
CREATE TABLE IF NOT EXISTS public.email_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mail_host text NOT NULL DEFAULT 'smtp.gmail.com',
  mail_port integer NOT NULL DEFAULT 587,
  mail_username text,
  mail_password_encrypted text,
  mail_encryption text NOT NULL DEFAULT 'TLS',
  mail_from_address text,
  mail_from_name text NOT NULL DEFAULT 'Forum Indonesia Muda',
  daily_rate_limit integer NOT NULL DEFAULT 2000,
  retry_max_attempts integer NOT NULL DEFAULT 3,
  retry_delay_seconds integer NOT NULL DEFAULT 60,
  queue_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Only super admin can manage email settings
CREATE POLICY "Super admin can manage email settings" ON public.email_settings
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add daily sent counter to notification_queue tracking
ALTER TABLE public.notification_queue
ADD COLUMN IF NOT EXISTS delay_seconds integer DEFAULT 0;
