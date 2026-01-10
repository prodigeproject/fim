-- Fix 1: Drop overly permissive admin_sessions policy and create restrictive ones
DROP POLICY IF EXISTS "System can manage sessions" ON admin_sessions;

-- Only service_role can insert/update/delete sessions (for backend operations)
CREATE POLICY "Service role can manage sessions" ON admin_sessions
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can only delete their own sessions (for logout)
CREATE POLICY "Users can delete own sessions" ON admin_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only update their own sessions (for activity tracking)
CREATE POLICY "Users can update own sessions" ON admin_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own session only
CREATE POLICY "Users can insert own sessions" ON admin_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix 2: Add token expiration column for email verification
ALTER TABLE public.fim_registrations 
  ADD COLUMN IF NOT EXISTS email_verification_expires_at timestamptz;

-- Set expiration for existing tokens (24 hours from now for safety)
UPDATE fim_registrations 
SET email_verification_expires_at = NOW() + INTERVAL '24 hours'
WHERE email_verification_token IS NOT NULL 
  AND email_verification_expires_at IS NULL;

-- Add verification attempts column for rate limiting
ALTER TABLE public.fim_registrations 
  ADD COLUMN IF NOT EXISTS verification_attempts integer DEFAULT 0;