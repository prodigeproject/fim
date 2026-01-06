-- Fix 1: Secure the log_audit_event function
-- Remove user-controllable p_user_id parameter and use auth.uid() instead
-- Add action validation to prevent arbitrary action types

CREATE OR REPLACE FUNCTION public.log_audit_event(
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
  v_log_id UUID;
  v_allowed_actions TEXT[] := ARRAY[
    'login', 'logout', 
    'create_article', 'edit_article', 'delete_article', 'approve_article', 'reject_article', 'request_revision', 'pin_article', 'unpin_article', 'bulk_delete_articles', 'bulk_archive_articles', 'bulk_publish_articles',
    'toggle_user_active', 'assign_role', 'remove_role', 'create_admin_user', 'deactivate_user', 'activate_user',
    'newsletter_broadcast', 'schedule_broadcast', 'cancel_broadcast', 'add_subscriber', 'remove_subscriber', 'update_subscriber', 'deactivate_subscriber', 'activate_subscriber', 'delete_subscriber', 'bulk_import_subscribers',
    'create_club', 'update_club', 'delete_club', 'import_clubs_csv',
    'create_regional', 'update_regional', 'delete_regional', 'import_regionals_csv',
    'update_profile', 'terminate_session', 'unauthorized_access_attempt',
    'create_prd_document', 'edit_prd_document',
    'bulk_approve_registrations', 'bulk_reject_registrations', 'approve_registration', 'reject_registration'
  ];
BEGIN
  -- Validate action type
  IF NOT (p_action = ANY(v_allowed_actions)) THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action;
  END IF;
  
  -- Use auth.uid() instead of user-supplied parameter
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Fix 2: Make registration-photos bucket private (contains sensitive user photos)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'registration-photos';

-- Drop the overly permissive public SELECT policy for registration photos
DROP POLICY IF EXISTS "Registration photos are publicly accessible" ON storage.objects;

-- Create secure policy: Users can view their own photos, admins can view all
CREATE POLICY "Users can view own registration photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'registration-photos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin(auth.uid())
  )
);