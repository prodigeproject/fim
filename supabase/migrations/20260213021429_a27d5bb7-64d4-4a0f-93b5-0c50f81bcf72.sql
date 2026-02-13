
-- Fix: Restrict dynamic_roles and role_permissions SELECT to authenticated users only
-- This prevents unauthenticated users from seeing the entire RBAC structure

-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Anyone can view roles" ON public.dynamic_roles;
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.role_permissions;

-- Create authenticated-only SELECT policies
CREATE POLICY "Authenticated users can view roles"
ON public.dynamic_roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);
