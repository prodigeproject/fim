
-- Delete orphaned auth users (not in fim_registrations and not in profiles)
-- First clean up any training data referencing these orphans
DELETE FROM public.fim_training_registrations 
WHERE registration_id IN (
  SELECT au.id 
  FROM auth.users au
  LEFT JOIN public.fim_registrations fr ON fr.auth_user_id = au.id
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE fr.id IS NULL AND p.id IS NULL
);

-- Now delete the orphaned auth users using Supabase's admin function
-- We need to use a function approach since we can't directly delete from auth.users in migrations
-- Instead, let's create a temporary function
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
RETURNS TABLE(deleted_id uuid, deleted_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  orphan RECORD;
BEGIN
  FOR orphan IN
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.fim_registrations fr ON fr.auth_user_id = au.id
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE fr.id IS NULL AND p.id IS NULL
  LOOP
    DELETE FROM auth.users WHERE id = orphan.id;
    deleted_id := orphan.id;
    deleted_email := orphan.email;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Execute the cleanup
SELECT * FROM public.cleanup_orphaned_auth_users();

-- Drop the temporary function
DROP FUNCTION public.cleanup_orphaned_auth_users();
