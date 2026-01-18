-- Fix warn-level security issues

-- 1. Fix audit_logs INSERT policy: Only service_role should be able to insert
-- Drop existing INSERT policy and create a proper one
DROP POLICY IF EXISTS "Service role and authenticated can insert audit logs" ON public.audit_logs;

CREATE POLICY "Only service_role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Allow service_role (via database functions with SECURITY DEFINER)
-- The log_audit_event function uses SECURITY DEFINER so it can insert

-- 2. Fix login_attempts SELECT policy: Only admins can view
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;

CREATE POLICY "Only admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3. Fix unauthorized_access_attempts SELECT policy: Only admins can view
DROP POLICY IF EXISTS "Admins can view unauthorized access attempts" ON public.unauthorized_access_attempts;

CREATE POLICY "Only admins can view unauthorized access attempts"
ON public.unauthorized_access_attempts
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 4. Fix admin_notifications SELECT policy: Remove OR (user_id IS NULL)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.admin_notifications;

CREATE POLICY "Users can view their own notifications only"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());