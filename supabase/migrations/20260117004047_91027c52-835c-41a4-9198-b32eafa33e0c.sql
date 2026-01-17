-- Schedule daily interview reminder H-1 at 08:00 UTC (15:00 WIB)
SELECT cron.schedule(
  'send-interview-reminder-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://atfrjhydmhpdwfepbkij.supabase.co/functions/v1/send-interview-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0ZnJqaHlkbWhwZHdmZXBia2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MTkzNjgsImV4cCI6MjA4Mjk5NTM2OH0.ZOMdGL62eh4-E-8Thc4s9mKaGdZTZdmfuh11-wuc'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);