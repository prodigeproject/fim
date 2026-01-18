-- Fix conflicting audit_logs INSERT policy
DROP POLICY IF EXISTS "Only service_role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role and authenticated can insert audit logs" ON public.audit_logs;

-- Only allow inserts via the SECURITY DEFINER log_audit_event function
-- No direct INSERT policy needed since the function handles this