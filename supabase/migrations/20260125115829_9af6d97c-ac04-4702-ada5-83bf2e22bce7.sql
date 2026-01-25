-- Fix is_admin() so 'admin' role is treated as admin in RLS checks
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin'::app_role, 'admin'::app_role, 'moderator'::app_role)
  )
$$;