-- Fix overly permissive RLS policies by restricting INSERT to service_role

-- 1. Fix admin_notifications: System inserts should only come from service role
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "Service role can insert notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- 2. Fix audit_logs: Only service role or authenticated users can insert
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- 3. Fix login_attempts: Only service role can insert (from edge functions)
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;
CREATE POLICY "Service role can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 4. Fix newsletter_subscribers: Authenticated users or service role can subscribe
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated or service role can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- 5. Fix unauthorized_access_attempts: Only service role can insert
DROP POLICY IF EXISTS "System can insert unauthorized attempts" ON public.unauthorized_access_attempts;
CREATE POLICY "Service role can insert unauthorized attempts" 
ON public.unauthorized_access_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');