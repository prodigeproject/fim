-- Add is_pinned column to registration_settings for hero display
ALTER TABLE registration_settings 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Create index for pinned batch lookup
CREATE INDEX IF NOT EXISTS idx_registration_settings_pinned 
ON registration_settings(is_pinned) WHERE is_pinned = true;

-- Create rate_limit_logs table for API rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for rate limiting lookup
CREATE INDEX idx_rate_limit_logs_identifier ON rate_limit_logs(identifier, endpoint, window_start);

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_blocked_until TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Check if currently blocked
  SELECT rl.blocked_until INTO v_blocked_until
  FROM rate_limit_logs rl
  WHERE rl.identifier = p_identifier 
    AND rl.endpoint = p_endpoint
    AND rl.blocked_until > NOW()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN QUERY SELECT false, 0, v_blocked_until;
    RETURN;
  END IF;
  
  -- Count requests in current window
  SELECT COALESCE(SUM(rl.request_count), 0) INTO v_current_count
  FROM rate_limit_logs rl
  WHERE rl.identifier = p_identifier 
    AND rl.endpoint = p_endpoint
    AND rl.window_start > v_window_start;
  
  -- If over limit, block
  IF v_current_count >= p_max_requests THEN
    INSERT INTO rate_limit_logs (identifier, endpoint, blocked_until)
    VALUES (p_identifier, p_endpoint, NOW() + (p_window_seconds || ' seconds')::INTERVAL);
    
    RETURN QUERY SELECT false, 0, NOW() + (p_window_seconds || ' seconds')::INTERVAL;
    RETURN;
  END IF;
  
  -- Log the request
  INSERT INTO rate_limit_logs (identifier, endpoint, request_count, window_start)
  VALUES (p_identifier, p_endpoint, 1, NOW())
  ON CONFLICT DO NOTHING;
  
  RETURN QUERY SELECT true, p_max_requests - v_current_count - 1, NOW() + (p_window_seconds || ' seconds')::INTERVAL;
END;
$$;

-- Create cleanup function for old rate limit logs
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limit_logs WHERE created_at < NOW() - INTERVAL '1 day';
END;
$$;

-- RLS for rate_limit_logs
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
ON rate_limit_logs FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view rate limits"
ON rate_limit_logs FOR SELECT
USING (is_admin(auth.uid()));

-- Add google_service_account_key column to a settings table or create backup_settings
CREATE TABLE IF NOT EXISTS backup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gdrive_service_account_key TEXT,
  gdrive_folder_id TEXT,
  auto_backup_enabled BOOLEAN DEFAULT false,
  auto_backup_schedule TEXT DEFAULT '0 3 * * 0',
  last_backup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE backup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage backup settings"
ON backup_settings FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));