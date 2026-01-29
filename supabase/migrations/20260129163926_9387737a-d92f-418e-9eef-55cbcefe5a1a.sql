-- Add article collaborators table for multi-author support
CREATE TABLE public.article_collaborators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'contributor', -- 'contributor', 'reviewer', 'editor'
    can_edit boolean DEFAULT true,
    can_review boolean DEFAULT true,
    added_by uuid,
    added_at timestamp with time zone DEFAULT now(),
    UNIQUE(article_id, user_id)
);

-- Add inline review comments table
CREATE TABLE public.article_inline_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    version_id uuid REFERENCES public.article_versions(id) ON DELETE SET NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    selection_start integer, -- character position in content
    selection_end integer,
    selected_text text, -- the text that was selected for comment
    is_resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    parent_comment_id uuid REFERENCES public.article_inline_comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add recurring articles configuration table
CREATE TABLE public.article_recurrence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_template_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    recurrence_pattern text NOT NULL, -- 'daily', 'weekly', 'monthly'
    recurrence_day integer, -- day of week (0-6) or day of month (1-31)
    recurrence_time time NOT NULL DEFAULT '09:00:00',
    next_scheduled_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add SEO settings table
CREATE TABLE public.seo_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_site_verification text,
    google_analytics_id text,
    default_og_image text,
    default_twitter_card text DEFAULT 'summary_large_image',
    robots_txt_content text,
    sitemap_enabled boolean DEFAULT true,
    structured_data_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default SEO settings
INSERT INTO public.seo_settings (id) VALUES (gen_random_uuid());

-- Enable RLS on new tables
ALTER TABLE public.article_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_inline_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_collaborators
CREATE POLICY "Admins can view collaborators" ON public.article_collaborators
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert collaborators" ON public.article_collaborators
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Super admin can update collaborators" ON public.article_collaborators
    FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete collaborators" ON public.article_collaborators
    FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- RLS policies for article_inline_comments
CREATE POLICY "Admins can view inline comments" ON public.article_inline_comments
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert inline comments" ON public.article_inline_comments
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can update own comments or super admin" ON public.article_inline_comments
    FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete inline comments" ON public.article_inline_comments
    FOR DELETE USING (has_role(auth.uid(), 'super_admin') OR auth.uid() = user_id);

-- RLS policies for article_recurrence
CREATE POLICY "Admins can view recurrence" ON public.article_recurrence
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can manage recurrence" ON public.article_recurrence
    FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS policies for seo_settings
CREATE POLICY "Anyone can view SEO settings" ON public.seo_settings
    FOR SELECT USING (true);

CREATE POLICY "Super admin can manage SEO settings" ON public.seo_settings
    FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Add collaboration fields to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS is_collaborative boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_author_id uuid;

-- Update updated_at trigger for new tables
CREATE TRIGGER update_article_inline_comments_updated_at
    BEFORE UPDATE ON public.article_inline_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_recurrence_updated_at
    BEFORE UPDATE ON public.article_recurrence
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add new permission keys for the new features
INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT dr.id, 'seo_settings', 
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END,
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END,
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END,
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END
FROM public.dynamic_roles dr
WHERE dr.name IN ('super_admin', 'admin', 'moderator')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT dr.id, 'article_collaboration', 
    true,
    CASE WHEN dr.name IN ('super_admin', 'admin') THEN true ELSE false END,
    CASE WHEN dr.name IN ('super_admin', 'admin') THEN true ELSE false END,
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END
FROM public.dynamic_roles dr
WHERE dr.name IN ('super_admin', 'admin', 'moderator')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete)
SELECT dr.id, 'article_scheduling', 
    true,
    CASE WHEN dr.name IN ('super_admin', 'admin') THEN true ELSE false END,
    CASE WHEN dr.name IN ('super_admin', 'admin') THEN true ELSE false END,
    CASE WHEN dr.name = 'super_admin' THEN true ELSE false END
FROM public.dynamic_roles dr
WHERE dr.name IN ('super_admin', 'admin', 'moderator')
ON CONFLICT DO NOTHING;