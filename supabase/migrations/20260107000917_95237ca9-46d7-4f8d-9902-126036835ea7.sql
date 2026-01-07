-- Add SELECT policy for login_attempts table to allow super_admin and admin to view
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add SELECT policy for admin_sessions for admin role
DROP POLICY IF EXISTS "Users can view own sessions" ON public.admin_sessions;
CREATE POLICY "Users can view own sessions"
ON public.admin_sessions
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix profiles table to allow admin to view all profiles (for user management features)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) 
  OR has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add admin role to can insert profiles
DROP POLICY IF EXISTS "Super admin can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admin to view audit logs
DROP POLICY IF EXISTS "Super admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admin to view user_roles (needed for user management)
DROP POLICY IF EXISTS "Super admin can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  (user_id = auth.uid()) 
  OR has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admin to view unauthorized access attempts  
DROP POLICY IF EXISTS "Super admin can view unauthorized attempts" ON public.unauthorized_access_attempts;
CREATE POLICY "Admins can view unauthorized attempts"
ON public.unauthorized_access_attempts
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);