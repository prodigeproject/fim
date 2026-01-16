-- Enable pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Grant usage to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a cron job to run send-reminder-incomplete daily at 09:00 WIB (02:00 UTC)
-- This job will call the edge function via pg_net
SELECT cron.schedule(
  'send-reminder-incomplete-daily',
  '0 2 * * *', -- Daily at 02:00 UTC (09:00 WIB)
  $$
  SELECT
    net.http_post(
      url := 'https://atfrjhydmhpdwfepbkij.supabase.co/functions/v1/send-reminder-incomplete',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);