-- Create article_versions table for version history
CREATE TABLE public.article_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL,
    featured_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    author_affiliation TEXT,
    related_region TEXT,
    status TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    change_summary TEXT,
    UNIQUE(article_id, version_number)
);

-- Create index for faster queries
CREATE INDEX idx_article_versions_article_id ON public.article_versions(article_id);
CREATE INDEX idx_article_versions_created_at ON public.article_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view article versions"
ON public.article_versions
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert article versions"
ON public.article_versions
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete article versions"
ON public.article_versions
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Create table for tracking unauthorized access attempts for rate limiting notifications
CREATE TABLE public.unauthorized_access_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    username TEXT,
    email TEXT,
    attempted_path TEXT NOT NULL,
    user_role TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_unauthorized_attempts_user_id ON public.unauthorized_access_attempts(user_id);
CREATE INDEX idx_unauthorized_attempts_created_at ON public.unauthorized_access_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE public.unauthorized_access_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "System can insert unauthorized attempts"
ON public.unauthorized_access_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admin can view unauthorized attempts"
ON public.unauthorized_access_attempts
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete unauthorized attempts"
ON public.unauthorized_access_attempts
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Function to get next version number
CREATE OR REPLACE FUNCTION public.get_next_article_version(p_article_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM public.article_versions
    WHERE article_id = p_article_id;
    
    RETURN v_next_version;
END;
$$;