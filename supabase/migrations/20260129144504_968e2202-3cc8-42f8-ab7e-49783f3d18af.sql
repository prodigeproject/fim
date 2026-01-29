-- Update log_audit_event function to include missing actions
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text, 
  p_resource_type text DEFAULT NULL::text, 
  p_resource_id uuid DEFAULT NULL::uuid, 
  p_details jsonb DEFAULT NULL::jsonb, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_log_id UUID;
  v_allowed_actions TEXT[] := ARRAY[
    'login', 'logout', 
    'create_article', 'edit_article', 'delete_article', 'approve_article', 'reject_article', 'request_revision', 'pin_article', 'unpin_article', 'bulk_delete_articles', 'bulk_archive_articles', 'bulk_publish_articles',
    'toggle_user_active', 'assign_role', 'remove_role', 'create_admin_user', 'deactivate_user', 'activate_user', 'delete_user',
    'assign_dynamic_role', 'remove_dynamic_role',
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

-- Also update the overloaded version
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text, 
  p_resource_type text DEFAULT NULL::text, 
  p_resource_id uuid DEFAULT NULL::uuid, 
  p_details jsonb DEFAULT NULL::jsonb, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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