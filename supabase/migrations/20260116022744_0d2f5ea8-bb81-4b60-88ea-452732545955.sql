-- Create email_templates table for dynamic email template management
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view email templates"
  ON public.email_templates FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can insert email templates"
  ON public.email_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can update email templates"
  ON public.email_templates FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete email templates"
  ON public.email_templates FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Create interview_schedules table
CREATE TABLE public.interview_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.fim_registrations(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all interview schedules"
  ON public.interview_schedules FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert interview schedules"
  ON public.interview_schedules FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update interview schedules"
  ON public.interview_schedules FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admin can delete interview schedules"
  ON public.interview_schedules FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Users can view own interview schedule
CREATE POLICY "Users can view own interview schedule"
  ON public.interview_schedules FOR SELECT
  USING (
    registration_id IN (
      SELECT id FROM public.fim_registrations 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_schedules_updated_at
  BEFORE UPDATE ON public.interview_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default email templates
INSERT INTO public.email_templates (name, subject, html_content, description, variables) VALUES
('registration_approved', 'Selamat! Pendaftaran FIM Anda Disetujui', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Selamat {{name}}! 🎉</h2>
      <p>Pendaftaran Anda di Forum Indonesia Muda telah <strong style="color: #16a34a;">DISETUJUI</strong>.</p>
      {{#if note}}<div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #166534;"><strong>Catatan:</strong> {{note}}</p>
      </div>{{/if}}
      <p>Tim kami akan segera menghubungi Anda untuk langkah selanjutnya.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda</p>
    </div>
  </div>
</body>
</html>', 'Email notifikasi saat pendaftaran disetujui', '["name", "note"]'::jsonb),

('registration_rejected', 'Informasi Pendaftaran FIM', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo {{name}},</h2>
      <p>Terima kasih atas minat Anda untuk bergabung dengan Forum Indonesia Muda.</p>
      <p>Setelah kami tinjau, dengan berat hati kami informasikan bahwa pendaftaran Anda belum dapat kami terima saat ini.</p>
      {{#if note}}<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #991b1b;"><strong>Catatan:</strong> {{note}}</p>
      </div>{{/if}}
      <p>Jangan berkecil hati, Anda dapat mencoba mendaftar kembali di periode selanjutnya.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda</p>
    </div>
  </div>
</body>
</html>', 'Email notifikasi saat pendaftaran ditolak', '["name", "note"]'::jsonb),

('interview_scheduled', 'Jadwal Wawancara FIM Anda', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo {{name}}! 👋</h2>
      <p>Selamat! Anda lolos tahap administrasi dan akan melanjutkan ke tahap wawancara.</p>
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 10px 0; color: #1e40af;"><strong>📅 Tanggal:</strong> {{date}}</p>
        <p style="margin: 0 0 10px 0; color: #1e40af;"><strong>⏰ Waktu:</strong> {{time}}</p>
        {{#if location}}<p style="margin: 0 0 10px 0; color: #1e40af;"><strong>📍 Lokasi:</strong> {{location}}</p>{{/if}}
        {{#if meeting_link}}<p style="margin: 0; color: #1e40af;"><strong>🔗 Link Meeting:</strong> <a href="{{meeting_link}}">{{meeting_link}}</a></p>{{/if}}
      </div>
      {{#if notes}}<p><strong>Catatan:</strong> {{notes}}</p>{{/if}}
      <p>Mohon hadir tepat waktu. Jika ada kendala, silakan hubungi tim kami.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda</p>
    </div>
  </div>
</body>
</html>', 'Email notifikasi jadwal wawancara', '["name", "date", "time", "location", "meeting_link", "notes"]'::jsonb),

('interview_reminder', 'Reminder: Wawancara FIM Besok', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Reminder Wawancara</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #f59e0b; margin-top: 0;">Halo {{name}}!</h2>
      <p>Ini adalah pengingat bahwa wawancara FIM Anda dijadwalkan <strong>besok</strong>.</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 10px 0; color: #92400e;"><strong>📅 Tanggal:</strong> {{date}}</p>
        <p style="margin: 0 0 10px 0; color: #92400e;"><strong>⏰ Waktu:</strong> {{time}}</p>
        {{#if location}}<p style="margin: 0 0 10px 0; color: #92400e;"><strong>📍 Lokasi:</strong> {{location}}</p>{{/if}}
        {{#if meeting_link}}<p style="margin: 0; color: #92400e;"><strong>🔗 Link Meeting:</strong> <a href="{{meeting_link}}">{{meeting_link}}</a></p>{{/if}}
      </div>
      <p>Pastikan Anda sudah menyiapkan diri dengan baik. Semoga sukses!</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda</p>
    </div>
  </div>
</body>
</html>', 'Email reminder H-1 wawancara', '["name", "date", "time", "location", "meeting_link"]'::jsonb),

('incomplete_reminder', 'Reminder: Lengkapi Formulir Pendaftaran FIM Anda', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo {{name}}! 👋</h2>
      <p>Kami melihat bahwa pendaftaran Anda di Forum Indonesia Muda belum selesai.</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Progress saat ini: {{progress}}%</strong></p>
      </div>
      <p>Segera lengkapi formulir pendaftaran Anda untuk melanjutkan proses seleksi.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Lanjutkan Pendaftaran →</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda</p>
    </div>
  </div>
</body>
</html>', 'Email reminder untuk formulir belum lengkap', '["name", "progress", "link"]'::jsonb);