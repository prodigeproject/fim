-- FIM Clubs table
CREATE TABLE public.fim_clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Users',
  description TEXT,
  activities TEXT[] DEFAULT '{}',
  instagram TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FIM Regionals table
CREATE TABLE public.fim_regionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  island TEXT NOT NULL,
  instagram TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Scheduled broadcasts table
CREATE TABLE public.scheduled_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_by UUID NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fim_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fim_regionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_broadcasts ENABLE ROW LEVEL SECURITY;

-- Clubs policies
CREATE POLICY "Anyone can view active clubs"
  ON public.fim_clubs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all clubs"
  ON public.fim_clubs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert clubs"
  ON public.fim_clubs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update clubs"
  ON public.fim_clubs FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete clubs"
  ON public.fim_clubs FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Regionals policies
CREATE POLICY "Anyone can view active regionals"
  ON public.fim_regionals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all regionals"
  ON public.fim_regionals FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert regionals"
  ON public.fim_regionals FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update regionals"
  ON public.fim_regionals FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete regionals"
  ON public.fim_regionals FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Scheduled broadcasts policies
CREATE POLICY "Admins can view broadcasts"
  ON public.scheduled_broadcasts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can insert broadcasts"
  ON public.scheduled_broadcasts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can update broadcasts"
  ON public.scheduled_broadcasts FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete broadcasts"
  ON public.scheduled_broadcasts FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_fim_clubs_updated_at
  BEFORE UPDATE ON public.fim_clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fim_regionals_updated_at
  BEFORE UPDATE ON public.fim_regionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_broadcasts_updated_at
  BEFORE UPDATE ON public.scheduled_broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();