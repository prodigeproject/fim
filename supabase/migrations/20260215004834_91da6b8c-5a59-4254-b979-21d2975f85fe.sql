
-- Create table for managing About page profiles (pengurus)
CREATE TABLE public.about_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'yayasan', -- yayasan, bph, biro_internal, divisi
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view active profiles
CREATE POLICY "Anyone can view active about profiles"
  ON public.about_profiles FOR SELECT
  USING (is_active = true);

-- Admins can view all
CREATE POLICY "Admins can view all about profiles"
  ON public.about_profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can insert
CREATE POLICY "Admins can insert about profiles"
  ON public.about_profiles FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update
CREATE POLICY "Admins can update about profiles"
  ON public.about_profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Super admin can delete
CREATE POLICY "Super admin can delete about profiles"
  ON public.about_profiles FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_about_profiles_updated_at
  BEFORE UPDATE ON public.about_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.about_profiles;
