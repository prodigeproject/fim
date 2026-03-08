-- Directly update password via auth admin (using a temporary function)
CREATE OR REPLACE FUNCTION public._temp_reset_password()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update password hash directly not possible from SQL, use auth.users update
  -- We'll use a different approach
  NULL;
END;
$$;
DROP FUNCTION IF EXISTS public._temp_reset_password();
