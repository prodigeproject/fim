-- =====================================================
-- FASE 1: INDEXES FOR QUERY OPTIMIZATION
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_fim_registrations_batch_stage 
ON fim_registrations(batch_id, selection_stage) 
WHERE registration_status != 'draft';

CREATE INDEX IF NOT EXISTS idx_fim_registrations_email 
ON fim_registrations(email);

CREATE INDEX IF NOT EXISTS idx_fim_registrations_auth_user 
ON fim_registrations(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_articles_status_published 
ON articles(status, published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_interview_schedules_date 
ON interview_schedules(scheduled_date, scheduled_time);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_activity
ON admin_sessions(user_id, last_activity DESC);

-- =====================================================
-- FASE 3: NOTIFICATION QUEUE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'in_app')),
  template_name TEXT NOT NULL,
  recipient_id UUID,
  recipient_email TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Index for efficient processing
CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_id);

-- RLS Policies
CREATE POLICY "Service role can manage notification queue"
ON notification_queue FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view notification queue"
ON notification_queue FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- FASE 5: CRON JOBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  schedule TEXT NOT NULL,
  function_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_status TEXT CHECK (last_status IN ('success', 'failed', 'running', 'skipped')),
  last_error TEXT,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admin can manage cron jobs"
ON cron_jobs FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view cron jobs"
ON cron_jobs FOR SELECT
USING (is_admin(auth.uid()));

-- Insert default jobs
INSERT INTO cron_jobs (name, description, schedule, function_name) VALUES
  ('cleanup-expired-sessions', 'Hapus sesi admin yang sudah expired', '0 */6 * * *', 'cleanup-sessions'),
  ('reminder-incomplete-registration', 'Kirim reminder ke pendaftar yang belum submit', '0 9 * * *', 'send-reminder-incomplete'),
  ('publish-scheduled-articles', 'Publish artikel yang terjadwal', '*/5 * * * *', 'publish-scheduled'),
  ('process-notification-queue', 'Proses antrian notifikasi', '* * * * *', 'process-notifications'),
  ('cleanup-orphaned-files', 'Hapus file yang tidak terpakai', '0 3 * * 0', 'cleanup-files')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- FASE 7: ERROR LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('user', 'system', 'external')),
  message TEXT,
  stack_trace TEXT,
  user_id UUID,
  context JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'error' CHECK (severity IN ('info', 'warn', 'error', 'critical')),
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_code ON error_logs(error_code);
CREATE INDEX idx_error_logs_severity ON error_logs(severity) WHERE severity IN ('error', 'critical');

-- RLS Policies
CREATE POLICY "Service role can insert error logs"
ON error_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view error logs"
ON error_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can manage error logs"
ON error_logs FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- FASE 9: MATERIALIZED VIEW FOR DASHBOARD STATS
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM fim_registrations WHERE registration_status = 'pending') as pending_registrations,
  (SELECT COUNT(*) FROM fim_registrations WHERE registration_status = 'completed') as completed_registrations,
  (SELECT COUNT(*) FROM fim_registrations WHERE selection_stage = 'wawancara') as interview_stage_count,
  (SELECT COUNT(*) FROM fim_registrations WHERE final_result = 'lolos') as accepted_count,
  (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
  (SELECT COUNT(*) FROM articles WHERE needs_approval = true AND status = 'draft') as pending_approvals,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true) as active_subscribers,
  (SELECT COUNT(*) FROM admin_sessions WHERE last_activity > NOW() - INTERVAL '30 minutes') as active_admins,
  NOW() as last_refreshed;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_stats_unique ON dashboard_stats(last_refreshed);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
EXCEPTION WHEN OTHERS THEN
  -- If concurrent refresh fails, do regular refresh
  REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Queue Notification
-- =====================================================

CREATE OR REPLACE FUNCTION queue_notification(
  p_type TEXT,
  p_template TEXT,
  p_recipient_id UUID DEFAULT NULL,
  p_recipient_email TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_scheduled_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification_queue (
    notification_type,
    template_name,
    recipient_id,
    recipient_email,
    payload,
    scheduled_at
  ) VALUES (
    p_type,
    p_template,
    p_recipient_id,
    p_recipient_email,
    p_payload,
    p_scheduled_at
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- =====================================================
-- TRIGGER: Auto-queue notification on registration status change
-- =====================================================

CREATE OR REPLACE FUNCTION notify_on_registration_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify on selection stage change
  IF OLD.selection_stage IS DISTINCT FROM NEW.selection_stage THEN
    INSERT INTO notification_queue (
      notification_type,
      template_name,
      recipient_id,
      recipient_email,
      payload
    ) VALUES (
      'email',
      'selection-stage-change',
      NEW.id,
      NEW.email,
      jsonb_build_object(
        'full_name', NEW.full_name,
        'old_stage', OLD.selection_stage,
        'new_stage', NEW.selection_stage
      )
    );
  END IF;
  
  -- Notify on final result
  IF OLD.final_result IS DISTINCT FROM NEW.final_result AND NEW.final_result IS NOT NULL THEN
    INSERT INTO notification_queue (
      notification_type,
      template_name,
      recipient_id,
      recipient_email,
      payload
    ) VALUES (
      'email',
      'final-result',
      NEW.id,
      NEW.email,
      jsonb_build_object(
        'full_name', NEW.full_name,
        'result', NEW.final_result
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_registration_update ON fim_registrations;
CREATE TRIGGER trigger_notify_registration_update
AFTER UPDATE ON fim_registrations
FOR EACH ROW
EXECUTE FUNCTION notify_on_registration_update();

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER FOR NEW TABLES
-- =====================================================

CREATE TRIGGER update_cron_jobs_updated_at
BEFORE UPDATE ON cron_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();