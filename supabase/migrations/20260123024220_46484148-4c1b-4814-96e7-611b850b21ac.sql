-- Drop the trigger that auto-creates profiles for ALL auth users
-- Participants should NOT have profiles - only admins should
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a more targeted function that only creates profiles for admin users
-- This function will be called manually by the admin-create-user edge function
-- Regular participants won't get profiles

-- Modify the existing function to NOT auto-create profiles
-- The function itself stays for manual use but we remove automatic trigger

-- Also, clean up any orphaned profiles (profiles that belong to participants, not admins)
-- by checking if the user has a user_role

-- We should NOT delete existing profiles that have roles
-- Only profiles where the user has NO role and IS in fim_registrations should be considered for cleanup
-- However, let's be conservative and NOT delete anything automatically
-- Instead, just remove the auto-create trigger

-- Add index for faster lookups on fim_registrations
CREATE INDEX IF NOT EXISTS idx_fim_registrations_email ON fim_registrations(email);
CREATE INDEX IF NOT EXISTS idx_fim_registrations_auth_user_id ON fim_registrations(auth_user_id);