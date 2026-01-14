-- Create table for partner logos management
CREATE TABLE public.partner_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active partner logos"
ON public.partner_logos FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all partner logos"
ON public.partner_logos FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert partner logos"
ON public.partner_logos FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update partner logos"
ON public.partner_logos FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete partner logos"
ON public.partner_logos FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_partner_logos_updated_at
BEFORE UPDATE ON public.partner_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for partner logos bucket
CREATE POLICY "Anyone can view partner logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'partner-logos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update partner logos files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'partner-logos' AND is_admin(auth.uid()));

CREATE POLICY "Super admin can delete partner logo files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'partner-logos' AND has_role(auth.uid(), 'super_admin'));