-- Create registration_settings table for batch-based registration
CREATE TABLE public.registration_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name text NOT NULL,
  batch_number integer NOT NULL,
  is_registration_open boolean NOT NULL DEFAULT false,
  registration_start_date timestamp with time zone,
  registration_end_date timestamp with time zone,
  max_participants integer,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(batch_number)
);

-- Add batch_id to fim_registrations
ALTER TABLE public.fim_registrations 
ADD COLUMN batch_id uuid REFERENCES public.registration_settings(id);

-- Enable RLS
ALTER TABLE public.registration_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registration_settings
CREATE POLICY "Anyone can view active registration settings"
ON public.registration_settings
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all registration settings"
ON public.registration_settings
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can insert registration settings"
ON public.registration_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can update registration settings"
ON public.registration_settings
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete registration settings"
ON public.registration_settings
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_registration_settings_updated_at
  BEFORE UPDATE ON public.registration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default batch (FIM 27)
INSERT INTO public.registration_settings (batch_name, batch_number, is_registration_open, description)
VALUES ('FIM 27: Kebijakan Publik', 27, false, 'Pelatihan FIM angkatan ke-27 dengan fokus Kebijakan Publik');

-- Create video_featured table for homepage video section
CREATE TABLE public.featured_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  youtube_id text NOT NULL,
  thumbnail_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active featured videos"
ON public.featured_videos
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all featured videos"
ON public.featured_videos
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert featured videos"
ON public.featured_videos
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update featured videos"
ON public.featured_videos
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete featured videos"
ON public.featured_videos
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_featured_videos_updated_at
  BEFORE UPDATE ON public.featured_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample featured video
INSERT INTO public.featured_videos (title, youtube_id, description, sort_order)
VALUES 
  ('Profil Forum Indonesia Muda', 'dQw4w9WgXcQ', 'Video profil resmi Forum Indonesia Muda', 1),
  ('Testimoni Alumni FIM', 'jNQXAC9IVRw', 'Cerita inspiratif dari alumni FIM', 2);