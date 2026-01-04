-- Add 'rejected' to article_status enum
ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'rejected';

-- Create alumni_stories table for cerita alumni
CREATE TABLE IF NOT EXISTS public.alumni_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  batch TEXT NOT NULL,
  sector TEXT NOT NULL,
  position TEXT,
  company TEXT,
  photo_url TEXT,
  quote TEXT,
  story TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alumni_other table for alumni FIM lainnya
CREATE TABLE IF NOT EXISTS public.alumni_other (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  batch TEXT NOT NULL,
  track_record TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create video_testimonials table
CREATE TABLE IF NOT EXISTS public.video_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  speaker TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table for admin panel
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.alumni_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_other ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alumni_stories
CREATE POLICY "Anyone can view active alumni stories" ON public.alumni_stories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all alumni stories" ON public.alumni_stories
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert alumni stories" ON public.alumni_stories
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update alumni stories" ON public.alumni_stories
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete alumni stories" ON public.alumni_stories
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for alumni_other
CREATE POLICY "Anyone can view active other alumni" ON public.alumni_other
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all other alumni" ON public.alumni_other
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert other alumni" ON public.alumni_other
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update other alumni" ON public.alumni_other
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete other alumni" ON public.alumni_other
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for video_testimonials
CREATE POLICY "Anyone can view active video testimonials" ON public.video_testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all video testimonials" ON public.video_testimonials
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert video testimonials" ON public.video_testimonials
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update video testimonials" ON public.video_testimonials
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete video testimonials" ON public.video_testimonials
  FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Users can view own notifications" ON public.admin_notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.admin_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.admin_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_alumni_stories_updated_at
  BEFORE UPDATE ON public.alumni_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alumni_other_updated_at
  BEFORE UPDATE ON public.alumni_other
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_testimonials_updated_at
  BEFORE UPDATE ON public.video_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();