-- Security Fix: Secure registration-photos storage bucket
-- Fix for: registration_photos_public

-- Set bucket to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'registration-photos';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view registration photos" ON storage.objects;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can view own registration photos" ON storage.objects;

-- Create restricted policy for viewing photos
CREATE POLICY "Users can view own registration photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'registration-photos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR is_admin(auth.uid())
  )
);

-- Security Fix: Add newsletter subscription rate limiting table
-- Fix for: newsletter_no_rate_limit

CREATE TABLE IF NOT EXISTS public.newsletter_subscription_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient IP-based lookups
CREATE INDEX IF NOT EXISTS idx_subscription_attempts_ip_time 
ON public.newsletter_subscription_attempts(ip_address, attempted_at);

-- Enable RLS on the new table
ALTER TABLE public.newsletter_subscription_attempts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Service role can insert subscription attempts" ON public.newsletter_subscription_attempts;
DROP POLICY IF EXISTS "Admins can view subscription attempts" ON public.newsletter_subscription_attempts;

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert subscription attempts"
ON public.newsletter_subscription_attempts
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Admins can view attempts (for monitoring)
CREATE POLICY "Admins can view subscription attempts"
ON public.newsletter_subscription_attempts
FOR SELECT
USING (is_admin(auth.uid()));

-- Security Fix: Add article view tracking table for rate limiting
-- Fix for: increment_view_bypass

CREATE TABLE IF NOT EXISTS public.article_view_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  last_viewed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, ip_address)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_article_view_tracking_lookup 
ON public.article_view_tracking(article_id, ip_address);

-- Enable RLS
ALTER TABLE public.article_view_tracking ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy
DROP POLICY IF EXISTS "Service role can manage view tracking" ON public.article_view_tracking;

-- Only service role can manage (from edge function)
CREATE POLICY "Service role can manage view tracking"
ON public.article_view_tracking
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Security Fix: Create admin audit log function that accepts user_id for service_role
-- Fix for: edge_fn_audit_log_params
-- This function is specifically for edge functions using service_role

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, resource_type, resource_id, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Clean up old subscription attempts (older than 24 hours) - scheduled cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_subscription_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.newsletter_subscription_attempts 
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Clean up old view tracking (older than 24 hours) - scheduled cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_view_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.article_view_tracking 
  WHERE last_viewed < NOW() - INTERVAL '24 hours';
END;
$$;