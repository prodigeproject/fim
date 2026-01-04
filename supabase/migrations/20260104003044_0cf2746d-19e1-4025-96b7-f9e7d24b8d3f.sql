-- Create PRD documentation table
CREATE TABLE public.prd_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'feature', -- feature, bug, enhancement, backlog
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  version TEXT,
  content TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PRD changelog table
CREATE TABLE public.prd_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  changes JSONB DEFAULT '[]'::jsonb,
  release_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create active sessions table for tracking logged in devices
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  is_current BOOLEAN DEFAULT false,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.prd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prd_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- PRD policies - only super admin
CREATE POLICY "Super admin can manage PRD documents" 
ON public.prd_documents FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can manage PRD changelog" 
ON public.prd_changelog FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Admin sessions policies
CREATE POLICY "Users can view own sessions" 
ON public.admin_sessions FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can manage sessions" 
ON public.admin_sessions FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_prd_documents_status ON public.prd_documents(status);
CREATE INDEX idx_prd_documents_category ON public.prd_documents(category);
CREATE INDEX idx_prd_changelog_version ON public.prd_changelog(version);
CREATE INDEX idx_admin_sessions_user_id ON public.admin_sessions(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_prd_documents_updated_at
  BEFORE UPDATE ON public.prd_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();