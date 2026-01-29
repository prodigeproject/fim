-- Table for reCAPTCHA settings (one key pair for all pages, per-page toggle)
CREATE TABLE public.recaptcha_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key text,
  secret_key_encrypted text, -- Stored encrypted; never exposed via API
  enabled_signup boolean DEFAULT false,
  enabled_login boolean DEFAULT false,
  enabled_forgot_password boolean DEFAULT false,
  enabled_admin_login boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recaptcha_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read/write
CREATE POLICY "Super admin can view recaptcha settings"
  ON public.recaptcha_settings FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can insert recaptcha settings"
  ON public.recaptcha_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can update recaptcha settings"
  ON public.recaptcha_settings FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can delete recaptcha settings"
  ON public.recaptcha_settings FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER update_recaptcha_settings_updated_at
  BEFORE UPDATE ON public.recaptcha_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row (empty keys, all disabled)
INSERT INTO public.recaptcha_settings (site_key, secret_key_encrypted, enabled_signup, enabled_login, enabled_forgot_password, enabled_admin_login)
VALUES ('', '', false, false, false, false);

-- Public function to get public reCAPTCHA config (only site_key and enabled flags, NO secret)
CREATE OR REPLACE FUNCTION public.get_recaptcha_public_config()
RETURNS TABLE (
  site_key text,
  enabled_signup boolean,
  enabled_login boolean,
  enabled_forgot_password boolean,
  enabled_admin_login boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(site_key, '') as site_key,
    COALESCE(enabled_signup, false) as enabled_signup,
    COALESCE(enabled_login, false) as enabled_login,
    COALESCE(enabled_forgot_password, false) as enabled_forgot_password,
    COALESCE(enabled_admin_login, false) as enabled_admin_login
  FROM public.recaptcha_settings
  LIMIT 1;
$$;