import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";
import { ReCaptcha } from "@/components/ReCaptcha";
import { useRecaptchaConfig } from "@/hooks/useRecaptchaConfig";

export default function RegistrationForgotPassword() {
  const { data: recaptchaConfig } = useRecaptchaConfig();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email harus diisi");
      return;
    }

    setIsSubmitting(true);

    // Validate reCAPTCHA if enabled
    if (recaptchaConfig?.enabled_forgot_password && recaptchaConfig?.site_key) {
      if (!recaptchaToken) {
        toast.error("Silakan verifikasi reCAPTCHA");
        setIsSubmitting(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-recaptcha", {
          body: { token: recaptchaToken },
        });
        if (error || !data?.success) {
          toast.error("Verifikasi reCAPTCHA gagal. Silakan coba lagi.");
          setRecaptchaToken(null);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        toast.error("Gagal memverifikasi reCAPTCHA");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // First check if email exists in fim_registrations table (registered applicant accounts)
      const { data: registrationData, error: registrationError } = await supabase
        .from("fim_registrations")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

      if (registrationError) {
        console.error("Registration check error:", registrationError);
      }

      if (!registrationData) {
        // Email not found in registered applicant accounts
        toast.error("Email tidak terdaftar sebagai pendaftar. Silakan gunakan email yang terdaftar.");
        setIsSubmitting(false);
        return;
      }

      // Email exists in registrations, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/reset-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast.success("Email reset password telah dikirim");
    } catch (error: any) {
      toast.error("Gagal mengirim email: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Lupa Password - Pendaftaran FIM"
        description="Reset password akun pendaftaran Forum Indonesia Muda"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Lupa Password</h1>
            <p className="text-muted-foreground mt-2">
              Masukkan email untuk reset password
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Kami akan mengirimkan link reset password ke email Anda
              </CardDescription>
            </CardHeader>

            {isEmailSent ? (
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Email Terkirim!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Silakan cek inbox email <strong>{email}</strong> untuk link reset password.
                    Jika tidak ada, cek folder spam.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEmailSent(false)}
                >
                  Kirim Ulang
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  {recaptchaConfig?.enabled_forgot_password && recaptchaConfig?.site_key && (
                    <ReCaptcha
                      siteKey={recaptchaConfig.site_key}
                      onVerify={(token) => setRecaptchaToken(token)}
                      onExpire={() => setRecaptchaToken(null)}
                      onError={() => setRecaptchaToken(null)}
                    />
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || (recaptchaConfig?.enabled_forgot_password && recaptchaConfig?.site_key && !recaptchaToken)}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Kirim Link Reset
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>

          <div className="text-center mt-6">
            <Link
              to="/portal/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
