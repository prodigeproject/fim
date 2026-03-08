import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";
import { ReCaptcha } from "@/components/ReCaptcha";
import { useRecaptchaConfig } from "@/hooks/useRecaptchaConfig";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function RegistrationLogin() {
  const navigate = useNavigate();
  const { signIn, isLoading, registration, user } = useRegistrationAuth();
  const { data: recaptchaConfig } = useRecaptchaConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileKey(prev => prev + 1);
  };

  // Dynamic error state
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && registration) {
      navigate("/portal/dashboard", { replace: true });
    }
  }, [user, registration, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsSubmitting(true);
    setNeedsVerification(false);
    setIsBlocked(false);
    setErrorType(null);
    setErrorMessage("");
    setRemainingAttempts(null);

    // Validate Turnstile
    if (!turnstileToken) {
      toast.error("Silakan selesaikan verifikasi Turnstile");
      return;
    }

    try {
      const { data: tsData, error: tsError } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });
      if (tsError || !tsData?.success) {
        toast.error("Verifikasi Turnstile gagal. Silakan coba lagi.");
        setTurnstileToken(null);
        return;
      }
    } catch {
      toast.error("Gagal memverifikasi Turnstile");
      return;
    }

    // Validate reCAPTCHA if enabled
    if (recaptchaConfig?.enabled_login && recaptchaConfig?.site_key) {
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

    const { error } = await signIn(email, password);
    
    if (error) {
      // Check for unverified email error
      if (error.message === "UNVERIFIED_EMAIL") {
        setNeedsVerification(true);
        setIsBlocked(false);
        setErrorType("unverified");
        setIsSubmitting(false);
        return;
      }
      // Check for blocked account
      if (error.message.includes("diblokir") || error.message.includes("blocked")) {
        setIsBlocked(true);
        setNeedsVerification(false);
        setErrorType("blocked");
        setIsSubmitting(false);
        return;
      }
      // Check for invalid credentials
      if (error.message.includes("salah") || error.message.includes("Invalid login credentials")) {
        setErrorType("invalid_credentials");
        setErrorMessage("Email atau password salah. Silakan periksa kembali.");
        setIsSubmitting(false);
        return;
      }
      // Check for not registered
      if (error.message.includes("tidak terdaftar")) {
        setErrorType("not_registered");
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }
      // Check for admin account
      if (error.message.includes("admin")) {
        setErrorType("admin_account");
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }
      // Generic error
      setErrorType("generic");
      setErrorMessage(error.message);
      setIsSubmitting(false);
    } else {
      toast.success("Login berhasil!");
      navigate("/portal/dashboard");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Masukkan email terlebih dahulu");
      return;
    }

    setIsResendingVerification(true);

    try {
      const response = await supabase.functions.invoke("send-verification-email", {
        body: { email: email.toLowerCase().trim() },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.");
    } catch (error: any) {
      toast.error("Gagal mengirim ulang email verifikasi: " + error.message);
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login Pendaftaran FIM" 
        description="Login untuk melanjutkan pendaftaran Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Pendaftaran Forum Indonesia Muda
            </h1>
            <p className="text-muted-foreground mt-2">
              Masuk untuk melanjutkan pendaftaran
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Masukkan email dan password yang telah didaftarkan
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Unverified email alert */}
                {errorType === "unverified" && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
                      <strong>Akun Belum Terverifikasi</strong>
                      <p className="mt-1 text-sm">
                        Email Anda sudah terdaftar, namun belum diverifikasi. 
                        Silakan cek inbox email Anda (termasuk folder spam) untuk link verifikasi.
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-amber-700 dark:text-amber-300 underline mt-1"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                      >
                        {isResendingVerification ? "Mengirim..." : "Kirim ulang email verifikasi"}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Blocked account alert */}
                {errorType === "blocked" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <strong>Akun Diblokir</strong>
                      <p className="mt-1 text-sm">
                        Akun Anda telah diblokir oleh administrator. 
                        Jika Anda merasa ini adalah kesalahan, silakan hubungi tim FIM.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Invalid credentials alert */}
                {errorType === "invalid_credentials" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <strong>Login Gagal</strong>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Not registered alert */}
                {errorType === "not_registered" && (
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="ml-2 text-blue-800 dark:text-blue-200">
                      <strong>Email Tidak Terdaftar</strong>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                      <Link 
                        to="/portal/signup" 
                        className="inline-block mt-2 text-blue-700 dark:text-blue-300 underline font-medium"
                      >
                        Daftar sekarang →
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Admin account alert */}
                {errorType === "admin_account" && (
                  <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
                    <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <AlertDescription className="ml-2 text-purple-800 dark:text-purple-200">
                      <strong>Akun Admin Terdeteksi</strong>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                      <a 
                        href="/admin" 
                        className="inline-block mt-2 text-purple-700 dark:text-purple-300 underline font-medium"
                      >
                        Login sebagai admin →
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Generic error alert */}
                {errorType === "generic" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <strong>Terjadi Kesalahan</strong>
                      <p className="mt-1 text-sm">{errorMessage}</p>
                    </AlertDescription>
                  </Alert>
                )}

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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/portal/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                {recaptchaConfig?.enabled_login && recaptchaConfig?.site_key && (
                  <ReCaptcha
                    siteKey={recaptchaConfig.site_key}
                    onVerify={(token) => setRecaptchaToken(token)}
                    onExpire={() => setRecaptchaToken(null)}
                    onError={() => setRecaptchaToken(null)}
                  />
                )}
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !turnstileToken || (recaptchaConfig?.enabled_login && recaptchaConfig?.site_key && !recaptchaToken)}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Masuk
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Belum punya akun? </span>
                  <Link 
                    to="/portal/signup" 
                    className="text-primary hover:underline font-medium"
                  >
                    Daftar sekarang
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
