-- Drop the old constraint
ALTER TABLE fim_registrations DROP CONSTRAINT IF EXISTS fim_registrations_registration_status_check;

-- Add new constraint with all needed statuses
ALTER TABLE fim_registrations ADD CONSTRAINT fim_registrations_registration_status_check 
CHECK (registration_status = ANY (ARRAY['pending'::text, 'incomplete'::text, 'completed'::text, 'approved'::text, 'rejected'::text]));