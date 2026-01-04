-- Enable realtime for audit_logs table to support login notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;