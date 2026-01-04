-- Create article_comments table for internal discussion
CREATE TABLE public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Admins can view comments on articles
CREATE POLICY "Admins can view article comments"
ON public.article_comments
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert comments
CREATE POLICY "Admins can insert article comments"
ON public.article_comments
FOR INSERT
WITH CHECK (is_admin(auth.uid()) AND user_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.article_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Super admin can delete any comment, users can delete own
CREATE POLICY "Users can delete own comments or super admin can delete any"
ON public.article_comments
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Add index for faster queries
CREATE INDEX idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX idx_article_comments_created_at ON public.article_comments(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_article_comments_updated_at
BEFORE UPDATE ON public.article_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();