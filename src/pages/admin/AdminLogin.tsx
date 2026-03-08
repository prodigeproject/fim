import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { SEO } from "@/components/SEO";
import { z } from "zod";
import { ReCaptcha } from "@/components/ReCaptcha";
import { useRecaptchaConfig } from "@/hooks/useRecaptchaConfig";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, user, role, isLoading: authLoading } = useAdminAuth();
  const { data: recaptchaConfig } = useRecaptchaConfig();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileRetries, setTurnstileRetries] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileKey(prev => prev + 1);
  };

  const handleTurnstileError = () => {
    setTurnstileError(true);
    setTurnstileRetries(prev => prev + 1);
    resetTurnstile();
  };

  const handleTurnstileRetry = () => {
    setTurnstileError(false);
    resetTurnstile();
  };

  // Redirect if already logged in with role
  useEffect(() => {
    if (!authLoading && user && role) {
      setRedirecting(true);
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    // Check if blocked
    if (attempts >= 5) {
      setError("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
      return;
    }

    setIsLoading(true);

    // Validate Turnstile
    if (!turnstileToken) {
      setError("Silakan selesaikan verifikasi Turnstile");
      setIsLoading(false);
      return;
    }

    try {
      const { data: tsData, error: tsError } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });
      if (tsError || !tsData?.success) {
        setError("Verifikasi Turnstile gagal. Silakan coba lagi.");
        resetTurnstile();
        setIsLoading(false);
        return;
      }
    } catch {
      setError("Gagal memverifikasi Turnstile");
      resetTurnstile();
      setIsLoading(false);
      return;
    }

    // Validate reCAPTCHA if enabled
    if (recaptchaConfig?.enabled_admin_login && recaptchaConfig?.site_key) {
      if (!recaptchaToken) {
        setError("Silakan verifikasi reCAPTCHA");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-recaptcha", {
          body: { token: recaptchaToken },
        });
        if (error || !data?.success) {
          setError("Verifikasi reCAPTCHA gagal. Silakan coba lagi.");
          setRecaptchaToken(null);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError("Gagal memverifikasi reCAPTCHA");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Sign in with email only
      const signInResult = await signIn(identifier.trim(), password);
      
      if (signInResult.error) {
        setAttempts(prev => prev + 1);
        
        // Handle blocked status
        if ((signInResult as any).blocked) {
          setError("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
        } else if ((signInResult as any).remainingAttempts !== undefined) {
          setError(`Email atau password salah. Tersisa ${(signInResult as any).remainingAttempts} percobaan.`);
        } else {
          setError("Email atau password salah. Silakan coba lagi.");
        }
        resetTurnstile();
        setIsLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      resetTurnstile();
      setIsLoading(false);
    }
  };

  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            {redirecting ? "Mengalihkan..." : "Memuat..."}
          </p>
        </div>
      </div>
    );
  }

  // Already logged in, show loading while redirect happens
  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Login" 
        description="Login ke panel admin FIM"
        noIndex={true}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Masuk ke panel administrasi FIM
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {attempts >= 3 && attempts < 5 && (
                <Alert>
                  <AlertDescription>
                    Tersisa {5 - attempts} percobaan login
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="email@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || attempts >= 5}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || attempts >= 5}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {recaptchaConfig?.enabled_admin_login && recaptchaConfig?.site_key && (
                <ReCaptcha
                  siteKey={recaptchaConfig.site_key}
                  onVerify={(token) => setRecaptchaToken(token)}
                  onExpire={() => setRecaptchaToken(null)}
                  onError={() => setRecaptchaToken(null)}
                />
              )}

              <TurnstileWidget
                key={turnstileKey}
                onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); }}
                onExpire={() => handleTurnstileError()}
                onError={() => handleTurnstileError()}
              />
              {turnstileError && (
                <div className="text-center space-y-2">
                  {turnstileRetries >= 3 ? (
                    <div className="text-sm text-destructive">
                      <p>Verifikasi gagal berulang kali.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                      >
                        Muat Ulang Halaman
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>Verifikasi gagal dimuat.</p>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={handleTurnstileRetry}
                      >
                        Coba Lagi Verifikasi
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || attempts >= 5 || !turnstileToken || (recaptchaConfig?.enabled_admin_login && recaptchaConfig?.site_key && !recaptchaToken)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Halaman ini hanya untuk administrator FIM. 
              <br />
              Sesi akan berakhir otomatis setelah 30 menit tidak aktif.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

