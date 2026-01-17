-- Fix profiles table RLS policies to use PERMISSIVE instead of RESTRICTIVE
-- PERMISSIVE is the correct type for "allow" rules

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can delete profiles" ON public.profiles;

-- Recreate as PERMISSIVE policies (default behavior, explicit for clarity)

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (separate policy for admin access)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Users can update only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can insert profiles (for creating new admin users)
CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Only super admin can delete profiles
CREATE POLICY "Super admin can delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Deny anonymous access completely by not having any policies for anon role
-- This is implicit since we use TO authenticated