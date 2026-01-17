-- Fix: Remove hardcoded anon key from cron job by using no-auth approach
-- The edge function already has verify_jwt = false, so no auth header needed

-- First unschedule the existing cron job (may have been partially created)
SELECT cron.unschedule('send-interview-reminder-daily');

-- Reschedule the cron job WITHOUT authentication header
-- Since verify_jwt = false in config.toml, the function accepts unauthenticated calls
SELECT cron.schedule(
  'send-interview-reminder-daily',
  '0 8 * * *', -- Every day at 08:00 UTC (15:00 WIB)
  $$
  SELECT net.http_post(
    url := 'https://atfrjhydmhpdwfepbkij.supabase.co/functions/v1/send-interview-reminder',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) AS request_id;
  $$
);