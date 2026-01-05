-- Tabel untuk data registrasi umum
CREATE TABLE public.fim_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'incomplete', 'completed')),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel untuk data pelatihan FIM (auto-saved)
CREATE TABLE public.fim_training_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES public.fim_registrations(id) ON DELETE CASCADE,
  
  -- Biodata
  birth_date DATE,
  birth_place TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  city TEXT,
  province TEXT,
  education TEXT,
  institution TEXT,
  major TEXT,
  graduation_year TEXT,
  occupation TEXT,
  organization TEXT,
  
  -- Pengalaman Organisasi (JSON array)
  organizational_experience JSONB DEFAULT '[]',
  
  -- 5 Prestasi/Pencapaian Terbaik (JSON array)
  achievements JSONB DEFAULT '[]',
  
  -- Motivasi
  motivation TEXT,
  how_did_you_know TEXT,
  why_join_fim TEXT,
  
  -- Analisis Kepedulian Sosial
  social_issue_concern TEXT,
  social_contribution_experience TEXT,
  
  -- Perencanaan Kontribusi Strategis
  strategic_contribution_plan TEXT,
  impact_expected TEXT,
  
  -- Meta
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  completion_percentage INT DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  is_submitted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fim_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fim_training_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fim_registrations
CREATE POLICY "Users can view own registration" ON public.fim_registrations
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own registration" ON public.fim_registrations
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own registration" ON public.fim_registrations
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all registrations" ON public.fim_registrations
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage registrations" ON public.fim_registrations
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for fim_training_registrations
CREATE POLICY "Users can manage own training data" ON public.fim_training_registrations
  FOR ALL USING (
    registration_id IN (
      SELECT id FROM public.fim_registrations WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all training data" ON public.fim_training_registrations
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage training data" ON public.fim_training_registrations
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Create updated_at trigger for fim_registrations
CREATE TRIGGER update_fim_registrations_updated_at
  BEFORE UPDATE ON public.fim_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for fim_training_registrations
CREATE TRIGGER update_fim_training_registrations_updated_at
  BEFORE UPDATE ON public.fim_training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();