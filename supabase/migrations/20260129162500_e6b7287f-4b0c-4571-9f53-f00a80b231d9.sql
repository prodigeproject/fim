-- Add new permission keys for all existing roles

-- Get all role IDs first
WITH new_permissions AS (
  SELECT unnest(ARRAY[
    'article_analytics',
    'email_settings',
    'email_templates',
    'partners',
    'featured_videos',
    'recruiter_assignments',
    'interview_calendar',
    'registration_settings',
    'registration_stats',
    'online_admins',
    'login_monitoring',
    'recaptcha',
    'technical_docs'
  ]) AS permission_key
),
role_ids AS (
  SELECT id, name FROM dynamic_roles
)
INSERT INTO role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT 
  r.id,
  p.permission_key,
  CASE 
    WHEN r.name = 'super_admin' THEN true
    WHEN r.name = 'admin' AND p.permission_key IN ('article_analytics', 'partners', 'featured_videos', 'interview_calendar', 'online_admins') THEN true
    WHEN r.name = 'moderator' AND p.permission_key IN ('interview_calendar') THEN true
    ELSE false
  END as can_view,
  CASE 
    WHEN r.name = 'super_admin' THEN true
    WHEN r.name = 'admin' AND p.permission_key IN ('partners', 'featured_videos') THEN true
    ELSE false
  END as can_create,
  CASE 
    WHEN r.name = 'super_admin' THEN true
    WHEN r.name = 'admin' AND p.permission_key IN ('partners', 'featured_videos') THEN true
    ELSE false
  END as can_edit,
  CASE 
    WHEN r.name = 'super_admin' THEN true
    ELSE false
  END as can_delete
FROM role_ids r
CROSS JOIN new_permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_key = p.permission_key
);