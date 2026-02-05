-- Add RLS policy to allow moderators (any is_admin role) to update fim_registrations
-- Currently only super_admin has full access, we need to allow moderators to update as well

-- First, let's add a policy that allows any admin role to update registrations
-- This includes super_admin, admin, and moderator roles

CREATE POLICY "Admins can update registrations"
ON public.fim_registrations
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));