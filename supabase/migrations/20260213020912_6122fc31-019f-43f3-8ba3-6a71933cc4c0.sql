
-- Remove materialized view from API exposure by revoking access from anon and authenticated roles
REVOKE SELECT ON public.dashboard_stats FROM anon;
REVOKE SELECT ON public.dashboard_stats FROM authenticated;

-- Grant access only to service_role and admins will access via RPC or edge functions
GRANT SELECT ON public.dashboard_stats TO service_role;
