-- Create new table for dynamic roles
CREATE TABLE public.dynamic_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_system boolean DEFAULT false, -- System roles cannot be deleted
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for role permissions
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.dynamic_roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, permission_key)
);

-- Create table to link users to dynamic roles
CREATE TABLE public.user_dynamic_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.dynamic_roles(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE public.dynamic_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dynamic_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dynamic_roles
CREATE POLICY "Anyone can view roles"
ON public.dynamic_roles FOR SELECT
USING (true);

CREATE POLICY "Super admin can insert roles"
ON public.dynamic_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can update roles"
ON public.dynamic_roles FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete non-system roles"
ON public.dynamic_roles FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role) AND is_system = false);

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can view permissions"
ON public.role_permissions FOR SELECT
USING (true);

CREATE POLICY "Super admin can insert permissions"
ON public.role_permissions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can update permissions"
ON public.role_permissions FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete permissions"
ON public.role_permissions FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for user_dynamic_roles
CREATE POLICY "Admins can view user roles"
ON public.user_dynamic_roles FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
);

CREATE POLICY "Super admin can insert user roles"
ON public.user_dynamic_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can update user roles"
ON public.user_dynamic_roles FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete user roles"
ON public.user_dynamic_roles FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default system roles
INSERT INTO public.dynamic_roles (name, label, description, is_system) VALUES
('super_admin', 'Super Admin', 'Akses penuh ke semua fitur sistem', true),
('admin', 'Admin', 'Akses administratif tanpa manajemen user', true),
('moderator', 'Moderator', 'Akses terbatas untuk moderasi konten', true);

-- Define available permission keys
-- Insert default permissions for super_admin
INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.dynamic_roles WHERE name = 'super_admin'),
  permission_key,
  true, true, true, true
FROM (VALUES 
  ('dashboard'),
  ('articles'),
  ('article_approvals'),
  ('newsletter'),
  ('clubs'),
  ('regionals'),
  ('alumni'),
  ('registrations'),
  ('users'),
  ('sessions'),
  ('audit_logs'),
  ('security'),
  ('roles'),
  ('prd_docs')
) AS t(permission_key);

-- Insert default permissions for admin
INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.dynamic_roles WHERE name = 'admin'),
  permission_key,
  can_view, can_create, can_edit, can_delete
FROM (VALUES 
  ('dashboard', true, false, false, false),
  ('articles', true, true, true, true),
  ('article_approvals', true, false, true, false),
  ('newsletter', true, true, true, false),
  ('clubs', true, true, true, false),
  ('regionals', true, true, true, false),
  ('alumni', true, true, true, false),
  ('registrations', true, false, true, false),
  ('users', false, false, false, false),
  ('sessions', true, false, false, false),
  ('audit_logs', true, false, false, false),
  ('security', true, false, false, false),
  ('roles', false, false, false, false),
  ('prd_docs', false, false, false, false)
) AS t(permission_key, can_view, can_create, can_edit, can_delete);

-- Insert default permissions for moderator
INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.dynamic_roles WHERE name = 'moderator'),
  permission_key,
  can_view, can_create, can_edit, can_delete
FROM (VALUES 
  ('dashboard', true, false, false, false),
  ('articles', true, true, true, false),
  ('article_approvals', true, false, false, false),
  ('newsletter', false, false, false, false),
  ('clubs', false, false, false, false),
  ('regionals', false, false, false, false),
  ('alumni', false, false, false, false),
  ('registrations', false, false, false, false),
  ('users', false, false, false, false),
  ('sessions', true, false, false, false),
  ('audit_logs', false, false, false, false),
  ('security', false, false, false, false),
  ('roles', false, false, false, false),
  ('prd_docs', false, false, false, false)
) AS t(permission_key, can_view, can_create, can_edit, can_delete);

-- Create function to check dynamic permissions
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid, 
  _permission_key text, 
  _action text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_dynamic_roles udr
    JOIN public.role_permissions rp ON rp.role_id = udr.role_id
    WHERE udr.user_id = _user_id 
      AND rp.permission_key = _permission_key
      AND (
        (_action = 'view' AND rp.can_view = true) OR
        (_action = 'create' AND rp.can_create = true) OR
        (_action = 'edit' AND rp.can_edit = true) OR
        (_action = 'delete' AND rp.can_delete = true)
      )
  )
  -- Also check legacy user_roles table
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.dynamic_roles dr ON dr.name = ur.role::text
    JOIN public.role_permissions rp ON rp.role_id = dr.id
    WHERE ur.user_id = _user_id
      AND rp.permission_key = _permission_key
      AND (
        (_action = 'view' AND rp.can_view = true) OR
        (_action = 'create' AND rp.can_create = true) OR
        (_action = 'edit' AND rp.can_edit = true) OR
        (_action = 'delete' AND rp.can_delete = true)
      )
  )
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_dynamic_roles_updated_at
BEFORE UPDATE ON public.dynamic_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();